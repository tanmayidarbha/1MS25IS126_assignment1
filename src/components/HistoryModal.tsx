import React from 'react';
import { X, History, Trash2, ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                Analyzed Papers History
              </h3>
              <p className="text-xs text-slate-400">
                Cached analyses available instantly without additional token cost
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

        {/* List */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No papers analyzed yet. Enter an arXiv URL to begin!
            </p>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-indigo-500/50 hover:bg-slate-950 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-200 text-sm group-hover:text-indigo-300 transition">
                    {item.paperTitle}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {item.coreConcept.plainLanguageSummary}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    {item.yearOrVenue && <span>{item.yearOrVenue}</span>}
                    <span>{item.internshipOpportunities.length} Resume Projects</span>
                    <span className="text-emerald-400">
                      {item.tokenEfficiencyAudit?.totalEstimatedTokens || 1200} tokens
                    </span>
                  </div>
                </div>
                <div className="shrink-0 p-1 rounded-md text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3">
          {history.length > 0 ? (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
