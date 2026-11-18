'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Trash2, Loader2, Layers } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (!member) return;

      const { data } = await supabase
        .from('documents')
        .select('*, knowledge_base:knowledge_bases(name)')
        .eq('workspace_id', member.workspace_id)
        .order('created_at', { ascending: false });

      if (data) setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await supabase.from('documents').delete().eq('id', id);
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">All Documents</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Overview of all ingested files and URLs across your workspace.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <FileText className="w-12 h-12 mx-auto text-slate-600" />
          <div className="text-lg font-bold text-white">No documents found</div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Upload documents inside any Knowledge Base to begin indexing.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
          {documents.map((doc) => (
            <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center space-x-4 truncate">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium text-white truncate">{doc.title}</div>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span className="flex items-center space-x-1 text-indigo-300">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{doc.knowledge_base?.name || 'Knowledge Base'}</span>
                    </span>
                    <span>•</span>
                    <span className="uppercase">{doc.file_type}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${doc.status === 'completed' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/30'}`}>
                  {doc.status}
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
