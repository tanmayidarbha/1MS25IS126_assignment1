import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { InternshipOpportunity, ProjectScaffold } from '../types';

interface ScaffoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: InternshipOpportunity | null;
  scaffoldData: ProjectScaffold | null;
  isLoading: boolean;
  paperTitle: string;
}

export const ScaffoldModal: React.FC<ScaffoldModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  scaffoldData,
  isLoading,
  paperTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'script' | 'readme'>('script');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  const handleCopy = async (text: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">
                  GitHub Starter Repository Scaffold
                </h3>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                  {scaffoldData?.projectSlug || 'cs-project-scaffold'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extension: {opportunity.exactExtension}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium text-slate-300">
                Architecting starter repo, benchmark script & evaluation metrics...
              </p>
              <p className="text-xs text-slate-500">
                Targeting: {opportunity.targetedMetric}
              </p>
            </div>
          ) : scaffoldData ? (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                  <button
                    onClick={() => setActiveTab('script')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                      activeTab === 'script'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>{scaffoldData.starterScript.filename || 'benchmark.py'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tree')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                      activeTab === 'tree'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Directory File Tree</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('readme')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                      activeTab === 'readme'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>README.md</span>
                  </button>
                </div>

                {/* Copy current view */}
                <button
                  onClick={() => {
                    const text =
                      activeTab === 'script'
                        ? scaffoldData.starterScript.code
                        : activeTab === 'tree'
                        ? scaffoldData.fileTree
                        : scaffoldData.readmeMarkdown;
                    handleCopy(text, activeTab);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
                >
                  {copiedTab === activeTab ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy Current File</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tab Display */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-[460px] overflow-auto">
                {activeTab === 'script' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                      <span className="font-mono text-emerald-400">
                        {scaffoldData.starterScript.filename}
                      </span>
                      <span>Runnable benchmark skeleton with CUDA sync & metric timing</span>
                    </div>
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed overflow-x-auto">
                      {scaffoldData.starterScript.code}
                    </pre>
                  </div>
                )}

                {activeTab === 'tree' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                      <span className="font-mono text-indigo-400">Recommended Project Layout</span>
                      <span>Clean modular organization for Git repository</span>
                    </div>
                    <pre className="font-mono text-xs text-indigo-200/90 whitespace-pre leading-relaxed overflow-x-auto">
                      {scaffoldData.fileTree}
                    </pre>
                  </div>
                )}

                {activeTab === 'readme' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
                      <span className="font-mono text-amber-400">README.md Specification</span>
                      <span>Evaluation protocols, baseline comparisons, and setup</span>
                    </div>
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {scaffoldData.readmeMarkdown}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              Failed to load starter code. Please retry.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <span>Targeting: {opportunity.targetedMetric}</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
