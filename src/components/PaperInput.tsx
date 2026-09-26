import React, { useState, useEffect } from 'react';
import {
  Search,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SamplePaper } from '../types';

interface PaperInputProps {
  onAnalyze: (payload: {
    url?: string;
    title?: string;
    rawText?: string;
    focusArea?: string;
  }) => void;
  isLoading: boolean;
  samplePapers: SamplePaper[];
  onSelectSample: (sample: SamplePaper) => void;
}

export const PaperInput: React.FC<PaperInputProps> = ({
  onAnalyze,
  isLoading,
  samplePapers,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'search' | 'paste'>('url');
  const [urlInput, setUrlInput] = useState<string>('https://arxiv.org/abs/2312.00752'); // Default to Mamba paper
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [rawTitle, setRawTitle] = useState<string>('');
  const [rawContent, setRawContent] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('Systems & Edge Deployment');

  const focusOptions = [
    'Systems & Edge Deployment',
    'Model Efficiency & Quantization',
    'Algorithmic & Mathematical Foundations',
    'Large Language Models & Reasoning',
    'Computer Vision & Multimodal',
  ];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAnalyze({
      url: urlInput.trim(),
      focusArea,
    });
  };

  const handleRawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTitle.trim() && !rawContent.trim()) return;
    onAnalyze({
      title: rawTitle.trim(),
      rawText: rawContent.trim(),
      focusArea,
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/search-arxiv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      if (!res.ok) {
        throw new Error('Search request failed');
      }
      const data = await res.json();
      setSearchResults(data.papers || []);
      if (!data.papers || data.papers.length === 0) {
        setSearchError('No papers matched your query. Try a different academic keyword or arXiv ID.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search arXiv');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-5 sm:p-7 backdrop-blur-md">
      {/* Top Banner / Hero description */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Academic Paper Analysis & Internship Architect</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                &lt; 25k Token Budget
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Submit an arXiv URL, paper DOI, or search topic to extract core concepts, render Mermaid architecture, and generate 3rd-year CS resume projects.
            </p>
          </div>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === 'url'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Paper URL / arXiv ID</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Search arXiv Database</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === 'paste'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Paste Abstract / Text</span>
          </button>
        </div>
      </div>

      {/* Tab 1: URL / arXiv ID */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Research Paper URL or arXiv Identifier
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. https://arxiv.org/abs/2312.00752 or 1706.03762"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="absolute right-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Run Research Agent</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Supports arXiv, OpenReview, IEEE, ACL, direct PDF links, or paper IDs. Token-efficient ingestion automatically caches abstracts.
            </p>
          </div>
        </form>
      )}

      {/* Tab 2: Search arXiv */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch}>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Search arXiv by Keyword, Topic, or Author
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. FlashAttention, Low-Rank Adaptation, State Space Models, GRPO reasoning"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Querying arXiv...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {searchError && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              <span className="text-xs font-medium text-slate-400">
                Found {searchResults.length} academic preprints:
              </span>
              {searchResults.map((paper, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/40 transition"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-200 text-sm">{paper.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{paper.summary}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>arXiv:{paper.id}</span>
                      {paper.published && <span>{paper.published}</span>}
                      {paper.authors && <span>{paper.authors.join(', ')}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onAnalyze({
                        url: paper.url || `https://arxiv.org/abs/${paper.id}`,
                        title: paper.title,
                        rawText: paper.summary,
                        focusArea,
                      });
                    }}
                    disabled={isLoading}
                    className="shrink-0 rounded-lg bg-indigo-600/90 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    Analyze Paper
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Paste Abstract / Text */}
      {activeTab === 'paste' && (
        <form onSubmit={handleRawSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Paper Title (Optional)
            </label>
            <input
              type="text"
              value={rawTitle}
              onChange={(e) => setRawTitle(e.target.value)}
              placeholder="e.g. Scaling Laws for Neural Language Models"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-hidden"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Abstract or Key Methodology Excerpt
            </label>
            <textarea
              rows={4}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste paper abstract or introduction here..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-hidden leading-relaxed font-mono"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || (!rawTitle.trim() && !rawContent.trim())}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Text...</span>
              </>
            ) : (
              <>
                <span>Extract Concept & Architecture</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Focus Area & Presets Filter */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Student Specialization Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-slate-400">Target Focus:</span>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden font-medium"
          >
            {focusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Landmark Paper Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Landmarks:</span>
          </span>
          {samplePapers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => onSelectSample(paper)}
              disabled={isLoading}
              className="rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-slate-900 transition disabled:opacity-40"
              title={`${paper.title} (${paper.year})`}
            >
              {paper.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
