import React from 'react';
import { Cpu, ShieldCheck, Sparkles, BookOpen, Layers, History, ExternalLink } from 'lucide-react';
import { TokenEfficiencyAudit } from '../types';

interface HeaderProps {
  tokenAudit?: TokenEfficiencyAudit;
  onSelectSample: (paperId: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tokenAudit,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                ArXivArch
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/25">
                CS Research Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Architecture Extraction &bull; Mermaid.js Flowcharts &bull; Undergraduate Resume Roadmaps
            </p>
          </div>
        </div>

        {/* Right stats and tools */}
        <div className="flex items-center gap-3">
          {/* Token efficiency budget indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Token Budget:</span>
              <span className="font-mono font-medium text-emerald-400">
                {tokenAudit ? `${tokenAudit.totalEstimatedTokens.toLocaleString()} / 25,000` : '< 25,000 max'}
              </span>
              {tokenAudit && (
                <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[10px] text-emerald-400 font-mono">
                  {tokenAudit.headroomPercent}% headroom
                </span>
              )}
            </div>
          </div>

          {/* History button */}
          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
              title="View analyzed papers history"
            >
              <History className="h-3.5 w-3.5 text-indigo-400" />
              <span>Saved ({historyCount})</span>
            </button>
          )}

          {/* Documentation tag */}
          <a
            href="https://arxiv.org"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <span>arXiv.org</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
