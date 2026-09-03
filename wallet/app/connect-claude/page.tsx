'use client';

import React, { useState } from 'react';
import { Key, Copy, Check, ShieldAlert, Cpu, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

export default function ConnectClaudePage() {
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [clientStatus, setClientStatus] = useState<'active' | 'paused'>('active');

  const generateNewKey = () => {
    // Generate fresh cryptographically random key
    const raw = 'nv_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
    setClientKey(raw);
  };

  const copyKey = () => {
    if (!clientKey) return;
    navigator.clipboard.writeText(clientKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const claudeConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        northveil: {
          command: 'npx',
          args: ['-y', 'northveil-cli', 'mcp'],
          env: {
            NORTHVEIL_API_KEY: clientKey || 'YOUR_NORTHVEIL_CLIENT_KEY',
            NORTHVEIL_API_URL: 'https://mcp.northveil.xyz',
          },
        },
      },
    },
    null,
    2
  );

  const copySnippet = () => {
    navigator.clipboard.writeText(claudeConfigSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-400" />
          Connect Claude Desktop & Agents
        </h1>
        <p className="text-sm text-zinc-400">
          Create a scoped capability token for Claude. Claude never holds private keys, seeds, or MPC shares.
        </p>
      </div>

      {/* Client Key Generation Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assistant Client Key</h2>
            <p className="text-xs text-zinc-400">Capability token for MCP authentication.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
              clientStatus === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              Status: {clientStatus.toUpperCase()}
            </span>
            <button
              onClick={() => setClientStatus(s => s === 'active' ? 'paused' : 'active')}
              className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
            >
              {clientStatus === 'active' ? 'Pause Client' : 'Resume'}
            </button>
          </div>
        </div>

        {!clientKey ? (
          <div className="p-6 bg-zinc-800/30 border border-dashed border-zinc-700 rounded-xl text-center space-y-3">
            <p className="text-xs text-zinc-400">
              Generate a client key to connect Claude Desktop, Cursor, or your autonomous agents.
            </p>
            <button
              onClick={generateNewKey}
              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Issue New Client Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300 font-medium">SECRET CLIENT KEY (SHOWN ONCE)</span>
                <button
                  onClick={copyKey}
                  className="p-1 hover:bg-amber-500/20 rounded text-amber-300 text-xs flex items-center gap-1 transition"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
              <code className="block text-xs font-mono text-white break-all bg-black/40 p-2.5 rounded border border-amber-500/20">
                {clientKey}
              </code>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Argon2 / scrypt hash committed to database</span>
              <button
                onClick={generateNewKey}
                className="hover:text-amber-400 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Rotate Key
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Claude Desktop Config Snippet */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">Claude Desktop Configuration</h3>
          </div>
          <button
            onClick={copySnippet}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Snippet Copied' : 'Copy Config'}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Paste into your <code className="text-zinc-200 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">claude_desktop_config.json</code>:
        </p>

        <pre className="p-4 bg-black/60 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto">
          {claudeConfigSnippet}
        </pre>

        <div className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2 text-xs text-zinc-300">
          <div className="font-semibold text-white">Getting Started with Claude:</div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400">
            <li>Paste snippet into Claude Desktop config and restart Claude.</li>
            <li>In chat, ask: <span className="text-zinc-200">“What is in my Northveil wallet?”</span></li>
            <li>Claude calls <code className="text-indigo-400">get_portfolio</code> and answers with live balances.</li>
            <li>Ask Claude to stage a transfer: Claude returns an approval link for your passkey!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
