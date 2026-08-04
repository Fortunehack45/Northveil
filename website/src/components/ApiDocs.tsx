import React, { useState } from 'react';
import { Code, Play, Check, Copy, Terminal, ExternalLink, ShieldCheck, Server, Lock, Layers } from 'lucide-react';
import { getMcpServerUrl } from '../config/endpointConfig';

export const ApiDocs: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('get_portfolio');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { method: 'POST', path: '/api/v1/get_portfolio', desc: 'Fetch wallet net worth and token balances across multi-chain providers' },
    { method: 'POST', path: '/api/v1/deploy_smart_contract', desc: 'Deploy compiled Solidity contract to EVM network' },
    { method: 'POST', path: '/api/v1/send_transfer', desc: 'Execute on-chain cryptocurrency transaction transfer' },
    { method: 'POST', path: '/api/v1/get_wallet_info', desc: 'Fetch active wallet status and chain metadata' },
    { method: 'POST', path: '/api/v1/execute_swap', desc: 'Perform token swap via 1inch EVM / Jupiter Solana' },
    { method: 'GET', path: '/openapi.json', desc: 'Download complete OpenAPI 3.0 specification JSON' },
    { method: 'GET', path: '/health', desc: 'Check API server health & database ping status' },
    { method: 'GET', path: '/keep-alive', desc: 'Supabase keep-alive heartbeat runner' }
  ];

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const baseUrl = getMcpServerUrl();
      const res = await fetch(`${baseUrl}/api/v1/${selectedTool}`, {
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
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 text-left bg-[#0a0a0c]">
      
      {/* Title Banner */}
      <div className="bg-[#00f0ff] text-black border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#00f0ff] font-mono text-xs font-black uppercase">
          <Code className="w-4 h-4" /> OPENAPI 3.0 SPECIFICATION
        </div>
        <h1 className="text-3xl sm:text-6xl font-black text-black uppercase tracking-tighter leading-none">
          NORTHVEIL REST API <br />
          <span className="bg-black text-[#ccff00] px-2 py-0.5 inline-block my-1">ENDPOINT SPECIFICATION</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm font-bold text-black border-t-3 border-black pt-3">
          STANDARD RESTFUL HTTP ENDPOINTS FOR DIRECT SERVER-TO-SERVER INTEGRATION, AI AGENT BACKENDS, AND MOBILE APPS.
        </p>
      </div>

      {/* SECTION 1: AUTHENTICATION & RATE LIMITS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
          <Lock className="w-6 h-6 text-[#00f0ff]" />
          <span>1. AUTHENTICATION & SECURITY HEADERS</span>
        </h2>
        <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4 font-mono text-xs text-slate-200">
          <p>
            All REST requests to <code>/api/v1/*</code> endpoints must include a valid Northveil API key passed in the header:
          </p>
          <div className="bg-black border-2 border-white p-4 text-[#ccff00] font-bold space-y-1">
            <div>X-API-Key: nv_live_9f82a17b09c82415d8a9</div>
            <div>Authorization: Bearer nv_live_9f82a17b09c82415d8a9</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-black border-2 border-[#ccff00] p-4 space-y-1">
              <span className="text-[#ccff00] font-black block uppercase">RATE LIMIT POLICY:</span>
              <span className="text-slate-300">100 requests per 15-minute window per IP / API key.</span>
            </div>
            <div className="bg-black border-2 border-[#ff007f] p-4 space-y-1">
              <span className="text-[#ff007f] font-black block uppercase">SCOPED PERMISSIONS:</span>
              <span className="text-slate-300">Enforces read_only, transfer_enabled, contract_deploy_enabled.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ENDPOINTS & INTERACTIVE TESTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Endpoints List */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 border-b-3 border-white pb-3">
            <Layers className="w-5 h-5 text-[#ccff00]" />
            <span>2. AVAILABLE REST ROUTES</span>
          </h2>

          <div className="space-y-3 font-mono">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="bg-[#141419] border-2 border-white p-4 shadow-[4px_4px_0px_0px_#ccff00] flex items-start gap-3">
                <span className={`px-2.5 py-1 text-xs font-black uppercase border border-black ${
                  ep.method === 'POST' ? 'bg-[#00f0ff] text-black' : 'bg-[#ccff00] text-black'
                }`}>
                  {ep.method}
                </span>
                <div>
                  <code className="text-xs font-black text-white block">{ep.path}</code>
                  <span className="text-[11px] text-slate-300 block mt-1">{ep.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Endpoint Sandbox */}
        <div className="lg:col-span-6">
          <div className="bg-[#141419] border-3 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-5 font-mono">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
              <span className="text-sm font-black text-[#00f0ff] flex items-center gap-2 uppercase">
                <Terminal className="w-4 h-4 stroke-[3]" /> INTERACTIVE REST API RUNNER
              </span>
              <span className="bg-[#ccff00] text-black px-2 py-0.5 text-[10px] font-black uppercase border border-black">
                LIVE SANDBOX
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 uppercase font-bold block">SELECT TOOL ENDPOINT:</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full bg-black border-2 border-white p-3 text-xs font-black text-[#ccff00] focus:outline-none focus:border-[#00f0ff]"
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
              className="w-full py-3.5 bg-[#00f0ff] text-black font-black text-xs uppercase border-3 border-black shadow-[4px_4px_0px_0px_#ccff00] hover:bg-[#ccff00] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'EXECUTING ON-CHAIN REQUEST...' : 'EXECUTE LIVE API REQUEST'}</span>
            </button>

            {testResult && (
              <div className="bg-black border-2 border-[#00f0ff] p-4 space-y-2 max-h-64 overflow-y-auto text-xs">
                <div className="text-[10px] text-[#00f0ff] font-bold uppercase">RESPONSE PAYLOAD (200 OK):</div>
                <pre className="text-[11px] text-[#ccff00] whitespace-pre-wrap">
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
