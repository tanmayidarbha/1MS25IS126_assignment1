import React, { useState } from 'react';
import {
  FileText,
  AlertOctagon,
  Cpu,
  Sigma,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CoreConcept } from '../types';

interface CoreConceptViewProps {
  coreConcept: CoreConcept;
  paperTitle: string;
  paperAuthors?: string[];
  yearOrVenue?: string;
  paperUrl?: string;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({
  coreConcept,
  paperTitle,
  paperAuthors,
  yearOrVenue,
  paperUrl,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate word count of the plain language summary
  const words = coreConcept.plainLanguageSummary
    ? coreConcept.plainLanguageSummary.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const isUnderLimit = words <= 300;

  const handleCopySummary = async () => {
    const textToCopy = `Title: ${paperTitle}
${paperAuthors?.length ? `Authors: ${paperAuthors.join(', ')}` : ''}

1. Problem Statement:
${coreConcept.problemStatement}

2. Primary Methodology Introduced:
${coreConcept.primaryMethodology}

3. Key Mathematical/Algorithmic Breakthroughs:
${coreConcept.keyBreakthroughs}

Unified Core Concept (<300 Words):
${coreConcept.plainLanguageSummary}`;

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
                Core Concept Extraction
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono font-medium ${
                  isUnderLimit
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>{words} words</span>
                <span className="text-slate-500">(&lt; 300 constraint)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rigorous yet accessible plain-language synthesis
            </p>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied Core Concept</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copy Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Paper Metadata Badge Bar */}
      <div className="border-b border-slate-800/60 bg-slate-950/30 px-5 py-2.5 text-xs text-slate-400 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-200">{paperTitle}</span>
        {yearOrVenue && (
          <span className="rounded bg-slate-800/80 px-2 py-0.5 text-slate-300 font-mono">
            {yearOrVenue}
          </span>
        )}
        {paperAuthors && paperAuthors.length > 0 && (
          <span className="text-slate-400 truncate max-w-md">
            by {paperAuthors.slice(0, 3).join(', ')} {paperAuthors.length > 3 ? 'et al.' : ''}
          </span>
        )}
        {paperUrl && (
          <a
            href={paperUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-auto"
          >
            Source Paper &rarr;
          </a>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Unified 300-word synthesis banner */}
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-slate-900/50 p-4.5">
          <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Accessible Executive Summary (Under 300 Words)</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {coreConcept.plainLanguageSummary}
          </p>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Problem Statement */}
          <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2.5 text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
              <span>1. The Problem Statement</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {coreConcept.problemStatement}
            </p>
          </div>

          {/* 2. Primary Methodology */}
          <div className="rounded-xl border border-indigo-900/30 bg-indigo-950/10 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2.5 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>2. Primary Methodology</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {coreConcept.primaryMethodology}
            </p>
          </div>

          {/* 3. Mathematical Breakthrough */}
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2.5 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sigma className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>3. Algorithmic Breakthrough</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {coreConcept.keyBreakthroughs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
