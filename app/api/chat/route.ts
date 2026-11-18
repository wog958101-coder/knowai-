import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { answerWithRag } from '@/lib/ai/rag';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, knowledgeBaseId, sessionId } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    const workspaceId = member.workspace_id;

    // 1. Get or create chat session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const { data: newSession, error: sessError } = await supabase
        .from('chat_sessions')
        .insert({
          workspace_id: workspaceId,
          knowledge_base_id: knowledgeBaseId || null,
          user_id: user.id,
          title: query.slice(0, 50) + '...',
        })
        .select()
        .single();

      if (sessError) throw sessError;
      activeSessionId = newSession.id;
    }

    // 2. Save user message
    await supabase.from('chat_messages').insert({
      session_id: activeSessionId,
      role: 'user',
      content: query,
    });

    // 3. Perform RAG retrieval and generation
    const ragResult = await answerWithRag({
      query,
      workspaceId,
      knowledgeBaseId,
      supabaseClient: supabase,
    });

    // 4. Save assistant response with citations
    await supabase.from('chat_messages').insert({
      session_id: activeSessionId,
      role: 'assistant',
      content: ragResult.answer,
      citations: ragResult.citations,
    });

    return NextResponse.json({
      sessionId: activeSessionId,
      answer: ragResult.answer,
      citations: ragResult.citations,
    });
  } catch (err: any) {
    console.error('RAG Chat API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during chat' }, { status: 500 });
  }
}
