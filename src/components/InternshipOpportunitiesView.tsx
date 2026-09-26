import React, { useState } from 'react';
import {
  Briefcase,
  Target,
  Wrench,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Code2,
  Calendar,
  Layers,
  ArrowRight,
  FolderGit2,
} from 'lucide-react';
import { InternshipOpportunity } from '../types';

interface InternshipOpportunitiesViewProps {
  opportunities: InternshipOpportunity[];
  paperTitle: string;
  onOpenScaffold: (opportunity: InternshipOpportunity) => void;
}

export const InternshipOpportunitiesView: React.FC<InternshipOpportunitiesViewProps> = ({
  opportunities,
  paperTitle,
  onOpenScaffold,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyResumeBullet = async (bullet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
                  Future Work & 3rd-Year CS Student Internship Projects
                </h3>
                <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[11px] font-mono text-violet-300 border border-violet-500/20">
                  Resume-Ready Projects
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Actionable engineering extensions with targeted metrics, modern tech stacks, and STAR bullet templates
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            3 Practical Portfolio Extensions
          </span>
        </div>
      </div>

      {/* 3 Opportunities Cards */}
      <div className="p-5 sm:p-6 space-y-6">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="group rounded-xl border border-slate-800/90 bg-slate-950/60 p-5 transition-all hover:border-violet-500/40 hover:bg-slate-950/90 shadow-sm"
          >
            {/* Project title and header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 font-mono text-xs font-bold border border-violet-500/30">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 text-base sm:text-lg group-hover:text-violet-200 transition">
                    {opp.title}
                  </h4>
                  {opp.difficultyLevel && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Scope: {opp.difficultyLevel} &bull; Undergraduate Capstone / Internship Project
                    </span>
                  )}
                </div>
              </div>

              {/* Scaffold generator trigger button */}
              <button
                onClick={() => onOpenScaffold(opp)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition shadow-xs"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Generate Repo Starter</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Core specs: Exact Extension, Targeted Metric, Tech Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
              {/* Exact Extension */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Exact Extension</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                    {opp.exactExtension}
                  </p>
                </div>
              </div>

              {/* Targeted Performance Metric */}
              <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/15 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                    <Target className="h-3.5 w-3.5" />
                    <span>Targeted Metric</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 font-medium leading-snug">
                    {opp.targetedMetric}
                  </p>
                </div>
              </div>

              {/* Recommended Tech Stack */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Recommended Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {opp.recommendedTechStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-300 border border-slate-700/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Sprint Roadmap */}
            {opp.implementationSteps && opp.implementationSteps.length > 0 && (
              <div className="mb-4 rounded-lg border border-slate-800/80 bg-slate-900/40 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>4-Week Implementation Sprint Plan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {opp.implementationSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded bg-slate-900/90 border border-slate-800 p-2 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="font-mono text-indigo-400 font-bold shrink-0">W{sIdx + 1}:</span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Bullet Template (STAR Method) */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-950/15 p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>STAR Resume Bullet Template</span>
                </div>
                <button
                  onClick={() => handleCopyResumeBullet(opp.resumeBulletTemplate, idx)}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 transition"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy for Resume</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 italic font-serif leading-relaxed">
                &ldquo;{opp.resumeBulletTemplate}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
