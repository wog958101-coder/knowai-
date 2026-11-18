'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles,
  Globe
} from 'lucide-react';

export default function KnowledgeBaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const kbId = resolvedParams.id;

  const [kb, setKb] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [urlInput, setUrlInput] = useState('');
  const [importingUrl, setImportingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const loadKnowledgeBaseAndDocuments = useCallback(async () => {
    try {
      const [kbRes, docsRes] = await Promise.all([
        supabase.from('knowledge_bases').select('*').eq('id', kbId).single(),
        supabase.from('documents').select('*').eq('knowledge_base_id', kbId).order('created_at', { ascending: false }),
      ]);

      if (kbRes.data) setKb(kbRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error('Error loading KB details:', err);
    } finally {
      setLoading(false);
    }
  }, [kbId, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKnowledgeBaseAndDocuments();
  }, [loadKnowledgeBaseAndDocuments]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('knowledgeBaseId', kbId);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process document');

      setUploadSuccess(`Successfully processed "${file.name}" into ${data.chunksCount} vector chunks!`);
      loadKnowledgeBaseAndDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleUrlImport(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setImportingUrl(true);
    setUrlError(null);
    setUrlSuccess(null);

    try {
      const res = await fetch('/api/documents/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim(), knowledgeBaseId: kbId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import website');

      setUrlSuccess(`Successfully crawled and indexed website into ${data.chunksCount} vector chunks!`);
      setUrlInput('');
      loadKnowledgeBaseAndDocuments();
    } catch (err: any) {
      setUrlError(err.message || 'Failed to import website URL');
    } finally {
      setImportingUrl(false);
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Are you sure you want to delete this document and its embeddings?')) return;

    try {
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) throw error;
      loadKnowledgeBaseAndDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/knowledge-bases" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Bases</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{kb?.name || 'Knowledge Base'}</h1>
            <p className="mt-1 text-slate-400 text-sm">{kb?.description || 'Manage documents and AI ingestion.'}</p>
          </div>
          <Link
            href={`/dashboard/chat?kb=${kbId}`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-all flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chat with this KB</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Box */}
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Upload Document</h3>
                <p className="text-xs text-slate-400">PDF, DOCX, TXT, CSV, XLSX</p>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-all bg-slate-950/40 relative">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="space-y-2 pointer-events-none">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">Processing & embedding...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">Click to upload document</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Website Import Box */}
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Import Website URL</h3>
                <p className="text-xs text-slate-400">Crawl and index public web documentation</p>
              </div>
            </div>

            {urlError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{urlError}</span>
              </div>
            )}

            {urlSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{urlSuccess}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleUrlImport} className="space-y-3">
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://docs.company.com"
              disabled={importingUrl}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={importingUrl || !urlInput.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {importingUrl && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Import & Index Website</span>
            </button>
          </form>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Documents & URLs ({documents.length})</h3>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <FileText className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p>No documents uploaded in this knowledge base yet.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center space-x-4 truncate">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    {doc.file_type === 'url' ? <Globe className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-white truncate">{doc.title}</div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="uppercase">{doc.file_type}</span>
                      <span>•</span>
                      <span>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Web Crawl'}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${doc.status === 'completed' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : doc.status === 'failed' ? 'bg-red-950/80 text-red-300 border border-red-500/30' : 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/30'}`}>
                    {doc.status}
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
