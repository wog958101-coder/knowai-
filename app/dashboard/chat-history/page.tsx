'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, ArrowRight, Loader2, Bot, Trash2 } from 'lucide-react';

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
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
        .from('chat_sessions')
        .select('*, knowledge_base:knowledge_bases(name)')
        .eq('workspace_id', member.workspace_id)
        .order('created_at', { ascending: false });

      if (data) setSessions(data);
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, [fetchSessions]);

  async function handleDelete(sessionId: string) {
    if (!confirm('Are you sure you want to delete this chat session?')) return;
    try {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete chat session');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Chat History</h1>
          <p className="mt-1 text-slate-400 text-sm">
            Review previous RAG queries and conversations with KnowFlow AI.
          </p>
        </div>
        <Link
          href="/dashboard/chat"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition-all flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>New Chat</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-600" />
          <div className="text-lg font-bold text-white">No chat history yet</div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Start a conversation with the AI Assistant to see your chat history here.
          </p>
          <Link
            href="/dashboard/chat"
            className="mt-3 inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm"
          >
            Start Chatting
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
          {sessions.map((session) => (
            <div key={session.id} className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center space-x-4 truncate">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium text-white truncate">{session.title}</div>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>KB: {session.knowledge_base?.name || 'Global Search'}</span>
                    <span>•</span>
                    <span>{new Date(session.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/chat?session=${session.id}`}
                  className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold rounded-xl text-xs transition-all flex items-center space-x-1"
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Delete Chat Session"
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
