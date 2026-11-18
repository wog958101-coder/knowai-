import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chunkText } from '@/lib/parsers/extract';
import { generateEmbedding } from '@/lib/ai/embeddings';

// Helper to validate URL and prevent SSRF
function isValidPublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, knowledgeBaseId } = await req.json();

    if (!url || !knowledgeBaseId) {
      return NextResponse.json({ error: 'URL and knowledgeBaseId are required' }, { status: 400 });
    }

    if (!isValidPublicUrl(url)) {
      return NextResponse.json({ error: 'Invalid or restricted website URL (SSRF protection enforced)' }, { status: 400 });
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    const workspaceId = member.workspace_id;

    // 1. Insert document record
    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        knowledge_base_id: knowledgeBaseId,
        workspace_id: workspaceId,
        title: url,
        file_type: 'url',
        file_size: 0,
        status: 'processing',
      })
      .select()
      .single();

    if (docError) throw docError;

    // 2. Fetch website content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KnowFlowBot/1.0 (Enterprise Knowledge Assistant)',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const html = await response.text();

    // 3. Simple robust HTML-to-text extraction
    const cleanedText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      await supabase.from('documents').update({ status: 'failed', error_message: 'Extracted website content is too short or empty' }).eq('id', docRecord.id);
      return NextResponse.json({ error: 'Could not extract meaningful text from website URL' }, { status: 400 });
    }

    // 4. Chunk text and generate embeddings
    const chunks = chunkText(cleanedText, 500, 50);

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent);

      await supabase.from('document_chunks').insert({
        document_id: docRecord.id,
        workspace_id: workspaceId,
        content: chunkContent,
        chunk_index: i,
        embedding: JSON.stringify(embedding),
        metadata: { source: url, chunkIndex: i },
      });
    }

    // 5. Mark document as completed
    await supabase.from('documents').update({ status: 'completed' }).eq('id', docRecord.id);

    return NextResponse.json({ success: true, documentId: docRecord.id, chunksCount: chunks.length });
  } catch (err: any) {
    console.error('Website import error:', err);
    return NextResponse.json({ error: err.message || 'Failed to import website' }, { status: 500 });
  }
}
