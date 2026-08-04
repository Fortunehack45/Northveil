import React, { useState } from 'react';
import { Code, Play, Check, Copy, Terminal, ExternalLink } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('get_portfolio');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { method: 'POST', path: '/api/v1/get_portfolio', desc: 'Fetch wallet net worth and token balances' },
    { method: 'POST', path: '/api/v1/deploy_smart_contract', desc: 'Deploy compiled ERC-20 / custom Solidity contract' },
    { method: 'POST', path: '/api/v1/send_transfer', desc: 'Execute cryptocurrency transaction transfer' },
    { method: 'POST', path: '/api/v1/get_wallet_info', desc: 'Fetch active wallet status and chain metadata' },
    { method: 'POST', path: '/api/v1/execute_swap', desc: 'Swap tokens via 1inch EVM / Jupiter Solana' },
    { method: 'GET', path: '/openapi.json', desc: 'Download complete OpenAPI 3.0 specification JSON' },
    { method: 'GET', path: '/health', desc: 'Check API server health status' }
  ];

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/${selectedTool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'nv_live_9f82a17b09c82415d8a9'
        },
        body: JSON.stringify({ walletAddress: '0x71c8891575b50d22e032d847847c234a413d4cc8' })
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResult(JSON.stringify({ error: e.message || 'Call failed' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8 space-y-12 font-mono">
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00f0ff] text-black text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <Code className="w-4 h-4" /> OPENAPI 3.0 COMPLIANT REST ENDPOINTS
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          NORTHVEIL <span className="text-[#ccff00]">REST API SPECIFICATIONS</span>
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          In addition to MCP SSE streaming, Northveil exposes standard RESTful HTTP endpoints for direct server-to-server integration, AI agent backends, and mobile apps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Endpoints Directory List */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-lg font-black text-white uppercase border-b-2 border-white pb-2">
            📡 AVAILABLE REST API ROUTES
          </h3>
          <div className="space-y-3">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-4 bg-[#141419] border-2 border-white shadow-[4px_4px_0px_0px_#000] flex items-start gap-3">
                <span className={`px-2.5 py-1 text-black font-black text-xs uppercase border border-black ${
                  ep.method === 'POST' ? 'bg-[#ccff00]' : 'bg-[#00f0ff]'
                }`}>
                  {ep.method}
                </span>
                <div>
                  <code className="text-sm font-black text-white block">{ep.path}</code>
                  <span className="text-xs text-slate-400 block mt-1">{ep.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Endpoint Tester Terminal */}
        <div className="lg:col-span-6">
          <div className="bg-[#141419] border-4 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <span className="text-sm font-black text-[#00f0ff] uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4" /> INTERACTIVE REST API TESTER
              </span>
              <span className="text-[10px] bg-[#ccff00] text-black font-black px-2 py-0.5 border border-black">
                LIVE RUNNER
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase">Select Tool Endpoint:</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full bg-[#0a0a0c] border-2 border-white p-2.5 text-xs text-[#ccff00] font-black focus:outline-none"
              >
                <option value="get_portfolio">POST /api/v1/get_portfolio</option>
                <option value="deploy_smart_contract">POST /api/v1/deploy_smart_contract</option>
                <option value="send_transfer">POST /api/v1/send_transfer</option>
                <option value="get_wallet_info">POST /api/v1/get_wallet_info</option>
              </select>
            </div>

            <button
              onClick={runTest}
              disabled={loading}
              className="w-full py-3 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? 'EXECUTING ON-CHAIN API CALL...' : 'EXECUTE LIVE REST REQUEST'}</span>
            </button>

            {testResult && (
              <div className="p-4 bg-[#0a0a0c] border-2 border-[#ccff00] space-y-2 max-h-64 overflow-y-auto">
                <div className="text-[10px] text-[#ccff00] font-black uppercase">RESPONSE PAYLOAD (200 OK):</div>
                <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
