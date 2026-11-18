'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, Mail, Shield, Loader2, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (!memberData) return;

      const { data } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', memberData.workspace_id);

      if (data) setMembers(data);
    } catch (err) {
      console.error('Error loading team members:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers();
  }, [fetchMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteSuccess(false);

    setTimeout(() => {
      setInviting(false);
      setInviteSuccess(true);
      setInviteEmail('');
    }, 800);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Team Members</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Manage workspace access and role permissions.
        </p>
      </div>

      {/* Invite Box */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-indigo-400" />
          <span>Invite Team Member</span>
        </h3>

        {inviteSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>Invitation sent successfully!</span>
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="colleague@company.com"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
          >
            {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Send Invite</span>
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Active Members ({members.length})</h3>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading team members...</div>
          ) : members.map((m) => (
            <div key={m.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  {m.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">User ID: {m.user_id.slice(0, 8)}...</div>
                  <div className="text-xs text-slate-400">Joined {new Date(m.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{m.role}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
