import React from 'react';
import { Zap, Server, Shield, ExternalLink, CheckCircle } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  return (
    <div className="max-w-[96%] mx-auto py-8 px-2 sm:px-4 space-y-10 font-mono text-left bg-[#0a0a0c]">
      <div className="border-b-4 border-white pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00] text-black text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <Zap className="w-4 h-4" /> PRODUCTION DEPLOYMENT GUIDE
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          DEPLOYING YOUR <span className="text-[#00f0ff]">MCP SERVER & API TO VERCEL</span>
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Learn how to host your Northveil Web App, REST API endpoints, and Model Context Protocol (MCP) server on Vercel, Railway, or custom SSL domains.
        </p>
      </div>

      {/* Step-by-Step Vercel Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
          <div className="w-8 h-8 bg-[#ccff00] text-black font-black text-sm flex items-center justify-center border-2 border-black">
            1
          </div>
          <h3 className="text-lg font-black text-white uppercase">CONNECT GITHUB</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Push your repository to GitHub, log into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#00f0ff] underline">Vercel.com</a>, and import your project repository.
          </p>
        </div>

        <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-3">
          <div className="w-8 h-8 bg-[#00f0ff] text-black font-black text-sm flex items-center justify-center border-2 border-black">
            2
          </div>
          <h3 className="text-lg font-black text-white uppercase">SET ENV VARIABLES</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ETH_RPC_URL`, and `SEPOLIA_RPC_URL` in Vercel project settings.
          </p>
        </div>

        <div className="bg-[#141419] border-4 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-3">
          <div className="w-8 h-8 bg-[#ff007f] text-white font-black text-sm flex items-center justify-center border-2 border-black">
            3
          </div>
          <h3 className="text-lg font-black text-white uppercase">DEPLOY & CONNECT CLAUDE</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click Deploy! Vercel will host your web app and serverless MCP API endpoints on a dedicated SSL domain.
          </p>
        </div>
      </div>
    </div>
  );
};
