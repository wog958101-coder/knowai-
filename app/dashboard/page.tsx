'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Layers, FileText, MessageSquare, ArrowRight, Plus, Sparkles, Upload, Globe, ShieldCheck } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    knowledgeBasesCount: 0,
    documentsCount: 0,
    chatsCount: 0,
  });
  const [recentKbs, setRecentKbs] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadOverview() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user's workspace
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .single();

        if (!memberData) return;
        const workspaceId = memberData.workspace_id;

        // Fetch counts & lists in parallel
        const [kbRes, docRes, chatRes, recentKbRes, recentDocRes] = await Promise.all([
          supabase.from('knowledge_bases').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
          supabase.from('documents').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
          supabase.from('chat_sessions').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
          supabase.from('knowledge_bases').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(3),
          supabase.from('documents').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          knowledgeBasesCount: kbRes.count || 0,
          documentsCount: docRes.count || 0,
          chatsCount: chatRes.count || 0,
        });

        setRecentKbs(recentKbRes.data || []);
        setRecentDocs(recentDocRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [supabase]);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-violet-900/20 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Active & Secure</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to KnowFlow AI</h1>
          <p className="mt-1 text-slate-400 text-sm max-w-xl">
            Your AI knowledge assistants are ready to answer queries using verified company documents and manuals.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/knowledge-bases" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-all flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Knowledge Base</span>
          </Link>
          <Link href="/dashboard/chat" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-800 text-sm transition-all flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "Knowledge Bases", count: stats.knowledgeBasesCount, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-600/10" },
          { title: "Total Documents", count: stats.documentsCount, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-600/10" },
          { title: "AI Chat Sessions", count: stats.chatsCount, icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-600/10" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</div>
              <div className="text-3xl font-extrabold text-white mt-2">{stat.count}</div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Knowledge Bases & Quick Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Knowledge Bases</h2>
            <Link href="/dashboard/knowledge-bases" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentKbs.length === 0 ? (
              <div className="col-span-2 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                <Layers className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p>No knowledge bases created yet.</p>
                <Link href="/dashboard/knowledge-bases" className="mt-3 inline-block text-sm text-indigo-400 font-semibold hover:underline">
                  Create your first knowledge base →
                </Link>
              </div>
            ) : (
              recentKbs.map((kb) => (
                <Link key={kb.id} href={`/dashboard/knowledge-bases/${kb.id}`} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{kb.name}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{kb.description || 'No description provided.'}</p>
                </Link>
              ))
            )}
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Recently Ingested Documents</h2>
              <Link href="/dashboard/documents" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {recentDocs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No documents uploaded yet.
                </div>
              ) : (
                recentDocs.map((doc) => (
                  <div key={doc.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-medium text-white truncate">{doc.title}</div>
                        <div className="text-xs text-slate-400 uppercase">{doc.file_type}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${doc.status === 'completed' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/30'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/knowledge-bases" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center space-x-3 text-sm text-slate-200 transition-all">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Upload PDF / Document</span>
              </Link>
              <Link href="/dashboard/knowledge-bases" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center space-x-3 text-sm text-slate-200 transition-all">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Import Website URL</span>
              </Link>
              <Link href="/dashboard/chat" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center space-x-3 text-sm text-slate-200 transition-all">
                <MessageSquare className="w-5 h-5 text-violet-400" />
                <span>Ask AI Assistant</span>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h4 className="font-bold text-white">Secure RAG Guarantee</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your company knowledge chunks are securely indexed using pgvector. The AI assistant strictly restricts answers to verified documents with zero hallucination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
