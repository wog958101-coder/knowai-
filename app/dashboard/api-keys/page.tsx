'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, Check, Code, Shield } from 'lucide-react';

export default function ApiKeysPage() {
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('kf_live_9a87fbc6543210fedcba98');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = `<script src="https://knowflow.ai/widget.js" data-workspace-id="ws_active_123" data-kb-id="kb_primary" async></script>`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">API & Integrations</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Generate API keys for programmatic RAG access and embed AI chat widgets on your website.
        </p>
      </div>

      {/* API Keys Section */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live API Key</h3>
              <p className="text-xs text-slate-400">Use this key to authenticate backend RAG requests</p>
            </div>
          </div>
          <button onClick={() => alert('New API key generated!')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <input
            type="password"
            readOnly
            value={apiKey}
            className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-all flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Embed Widget Section */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Embeddable AI Chatbot Widget</h3>
            <p className="text-xs text-slate-400">Add the KnowFlow AI chatbot widget to your customer portal or website</p>
          </div>
        </div>

        <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
          <code>{embedCode}</code>
        </div>
      </div>
    </div>
  );
}
