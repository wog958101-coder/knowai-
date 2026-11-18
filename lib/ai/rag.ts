import { generateEmbedding } from './embeddings';

interface RagCitation {
  documentId: string;
  documentTitle: string;
  similarity: number;
  snippet: string;
}

interface RagResponse {
  answer: string;
  citations: RagCitation[];
}

export async function answerWithRag({
  query,
  workspaceId,
  knowledgeBaseId,
  supabaseClient,
}: {
  query: string;
  workspaceId: string;
  knowledgeBaseId?: string;
  supabaseClient: any;
}): Promise<RagResponse> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search relevant chunks via Supabase RPC `match_document_chunks`
  const { data: chunks, error } = await supabaseClient.rpc('match_document_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.35,
    match_count: 5,
    filter_workspace_id: workspaceId,
    filter_kb_id: knowledgeBaseId || null,
  });

  if (error) {
    console.error('Vector search RPC error:', error);
    throw new Error('Failed to search knowledge base chunks');
  }

  if (!chunks || chunks.length === 0) {
    return {
      answer: "I couldn't find enough information in your knowledge base to answer that accurately.",
      citations: [],
    };
  }

  // 3. Build context from retrieved chunks
  let contextText = '';
  const citations: RagCitation[] = [];
  const seenDocs = new Set<string>();

  chunks.forEach((chunk: any, idx: number) => {
    contextText += `\n[Source ${idx + 1}: ${chunk.document_title}]\n${chunk.content}\n`;
    if (!seenDocs.has(chunk.document_id)) {
      seenDocs.add(chunk.document_id);
      citations.push({
        documentId: chunk.document_id,
        documentTitle: chunk.document_title,
        similarity: Math.round((chunk.similarity || 0) * 100),
        snippet: chunk.content.slice(0, 160) + '...',
      });
    }
  });

  // 4. Call OpenRouter LLM or fallback if OPENROUTER_API_KEY is missing
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  const systemPrompt = `You are KnowFlow AI, an expert, precise corporate knowledge assistant.
Answer the user's question STRICTLY and EXCLUSIVELY using the provided company knowledge context below.
CRITICAL INSTRUCTION: If the answer cannot be fully determined or supported by the provided context, you MUST output:
"I couldn't find enough information in your knowledge base to answer that accurately."
Never invent company policies, facts, pricing, or procedures. Cite the source documents where appropriate.`;

  const userPrompt = `Context from company knowledge base:
${contextText}

User Question: ${query}`;

  let answer = '';

  if (openRouterApiKey && openRouterApiKey !== 'MY_OPENROUTER_API_KEY') {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://knowflow.ai',
          'X-Title': 'KnowFlow AI',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      const data = await res.json();
      if (data.choices && data.choices[0]?.message?.content) {
        answer = data.choices[0].message.content;
      } else {
        throw new Error(data.error?.message || 'OpenRouter API error');
      }
    } catch (err) {
      console.error('OpenRouter API call failed:', err);
      // Fallback response using context summary if OpenRouter fails
      answer = `Based on your company document "${chunks[0].document_title}": ${chunks[0].content.slice(0, 300)}... (Note: OpenRouter API key not configured or unreachable, showing direct document chunk match).`;
    }
  } else {
    // Demonstration / Mock RAG response when OpenRouter API key is not configured
    answer = `Based on the retrieved company knowledge from "${chunks[0].document_title}":\n\n${chunks[0].content.slice(0, 400)}...\n\n(Configure OPENROUTER_API_KEY in your environment variables for full LLM generative synthesis).`;
  }

  return {
    answer,
    citations,
  };
}
