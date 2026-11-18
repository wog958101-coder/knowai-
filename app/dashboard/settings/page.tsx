'use client';

import React, { useState } from 'react';
import { Settings, Shield, User, Building, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Workspace Settings</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Manage workspace preferences and security configurations.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Building className="w-5 h-5 text-indigo-400" />
          <span>Workspace Details</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
