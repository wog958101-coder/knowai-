import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractTextFromFile, chunkText } from '@/lib/parsers/extract';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string;

    if (!file || !knowledgeBaseId) {
      return NextResponse.json({ error: 'File and knowledgeBaseId are required' }, { status: 400 });
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    const workspaceId = member.workspace_id;

    // 1. Insert document record with 'processing' status
    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        knowledge_base_id: knowledgeBaseId,
        workspace_id: workspaceId,
        title: file.name,
        file_type: file.name.split('.').pop() || 'txt',
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single();

    if (docError) throw docError;

    // 2. Read buffer and extract text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = await extractTextFromFile(buffer, file.type, file.name);

    if (!extractedText || extractedText.trim().length === 0) {
      await supabase.from('documents').update({ status: 'failed', error_message: 'No text extracted from file' }).eq('id', docRecord.id);
      return NextResponse.json({ error: 'No text could be extracted from this document' }, { status: 400 });
    }

    // 3. Chunk text
    const chunks = chunkText(extractedText, 500, 50);

    // 4. Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent);

      await supabase.from('document_chunks').insert({
        document_id: docRecord.id,
        workspace_id: workspaceId,
        content: chunkContent,
        chunk_index: i,
        embedding: JSON.stringify(embedding),
        metadata: { source: file.name, chunkIndex: i },
      });
    }

    // 5. Mark document as completed
    await supabase.from('documents').update({ status: 'completed' }).eq('id', docRecord.id);

    return NextResponse.json({ success: true, documentId: docRecord.id, chunksCount: chunks.length });
  } catch (err: any) {
    console.error('Document upload processing error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during document processing' }, { status: 500 });
  }
}
