import React, { useState, useEffect } from 'react';
import {
  FileText,
  Network,
  Briefcase,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { Header } from './components/Header';
import { PaperInput } from './components/PaperInput';
import { CoreConceptView } from './components/CoreConceptView';
import { MermaidViewer } from './components/MermaidViewer';
import { InternshipOpportunitiesView } from './components/InternshipOpportunitiesView';
import { ScaffoldModal } from './components/ScaffoldModal';
import { HistoryModal } from './components/HistoryModal';
import {
  AnalysisResult,
  SamplePaper,
  InternshipOpportunity,
  ProjectScaffold,
} from './types';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [samplePapers, setSamplePapers] = useState<SamplePaper[]>([]);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Starter repo scaffold modal state
  const [scaffoldState, setScaffoldState] = useState<{
    isOpen: boolean;
    opportunity: InternshipOpportunity | null;
    scaffoldData: ProjectScaffold | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    opportunity: null,
    scaffoldData: null,
    isLoading: false,
  });

  // Load sample papers and localStorage history on mount
  useEffect(() => {
    // Fetch landmark sample papers
    fetch('/api/sample-papers')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) setSamplePapers(data.samples);
      })
      .catch((err) => console.warn('Failed to load sample papers:', err));

    // Load saved history
    try {
      const saved = localStorage.getItem('arxivarch_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setAnalysisResult(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
  }, []);

  // Save to history helper
  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.paperTitle !== newResult.paperTitle);
      const updated = [newResult, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('arxivarch_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to local storage:', e);
      }
      return updated;
    });
  };

  // Trigger analysis
  const handleAnalyze = async (payload: {
    url?: string;
    title?: string;
    rawText?: string;
    focusArea?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
      saveToHistory(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during paper analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Landmark sample click
  const handleSelectSample = (sample: SamplePaper) => {
    handleAnalyze({
      url: sample.url,
      title: sample.title,
      rawText: sample.abstract,
    });
  };

  // Generate GitHub repository starter scaffold
  const handleOpenScaffold = async (opportunity: InternshipOpportunity) => {
    setScaffoldState({
      isOpen: true,
      opportunity,
      scaffoldData: null,
      isLoading: true,
    });

    try {
      const res = await fetch('/api/generate-scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: analysisResult?.paperTitle || 'CS Research Paper',
          opportunity,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate starter code');

      const data: ProjectScaffold = await res.json();
      setScaffoldState((prev) => ({
        ...prev,
        scaffoldData: data,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error(err);
      setScaffoldState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  // Export full analysis as Markdown
  const handleExportMarkdown = () => {
    if (!analysisResult) return;

    const md = `# ${analysisResult.paperTitle}
${analysisResult.paperAuthors?.length ? `**Authors:** ${analysisResult.paperAuthors.join(', ')}\n` : ''}
${analysisResult.yearOrVenue ? `**Year/Venue:** ${analysisResult.yearOrVenue}\n` : ''}
${analysisResult.paperUrl ? `**Source:** [${analysisResult.paperUrl}](${analysisResult.paperUrl})\n` : ''}

---

## 1. Core Concept Extraction
*Constraint: Under 300 words*

### Problem Statement
${analysisResult.coreConcept.problemStatement}

### Primary Methodology Introduced
${analysisResult.coreConcept.primaryMethodology}

### Key Mathematical & Algorithmic Breakthroughs
${analysisResult.coreConcept.keyBreakthroughs}

### Accessible Summary
${analysisResult.coreConcept.plainLanguageSummary}

---

## 2. Architectural Flowchart (Mermaid.js)

${analysisResult.flowchartSegment}

\`\`\`mermaid
${analysisResult.mermaidCode}
\`\`\`

---

## 3. Future Work & 3rd-Year CS Student Internship Opportunities

${analysisResult.internshipOpportunities
  .map(
    (opp, i) => `### Project 0${i + 1}: ${opp.title}
- **Exact Extension:** ${opp.exactExtension}
- **Targeted Metric:** ${opp.targetedMetric}
- **Recommended Tech Stack:** ${opp.recommendedTechStack.join(', ')}
- **Implementation Sprint:**
${opp.implementationSteps.map((s, si) => `  - Week ${si + 1}: ${s}`).join('\n')}
- **STAR Resume Bullet:**
  > "${opp.resumeBulletTemplate}"
`
  )
  .join('\n\n')}

---
*Generated by ArXivArch CS Research Agent | Token Budget: ${analysisResult.tokenEfficiencyAudit.totalEstimatedTokens} / 25,000 tokens*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(analysisResult.paperTitle || 'cs-paper-analysis').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCompleteReport = async () => {
    if (!analysisResult) return;
    const text = `ARXIVARCH CS RESEARCH AGENT REPORT: ${analysisResult.paperTitle}

1. CORE CONCEPT EXTRACTION (<300 words):
${analysisResult.coreConcept.plainLanguageSummary}

2. ARCHITECTURAL FLOWCHART:
${analysisResult.flowchartSegment}

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
${analysisResult.internshipOpportunities
  .map(
    (o, i) => `[Project ${i + 1}] ${o.title}
Extension: ${o.exactExtension}
Target Metric: ${o.targetedMetric}
Tech Stack: ${o.recommendedTechStack.join(', ')}
Resume Bullet: "${o.resumeBulletTemplate}"`
  )
  .join('\n\n')}`;

    await navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        tokenAudit={analysisResult?.tokenEfficiencyAudit}
        onSelectSample={(id) => {
          const sample = samplePapers.find((p) => p.id === id);
          if (sample) handleSelectSample(sample);
        }}
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Paper Ingestion Section */}
        <PaperInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          samplePapers={samplePapers}
          onSelectSample={handleSelectSample}
        />

        {/* Error notification banner */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-rose-300 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">Analysis Failed: </span>
              {error}
            </div>
          </div>
        )}

        {/* Token Budget Gauge & Efficiency Banner (if results loaded) */}
        {analysisResult && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-xs backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-slate-200">
                Token Efficiency Compliance:
              </span>
              <span className="font-mono text-emerald-400 font-medium">
                {analysisResult.tokenEfficiencyAudit.totalEstimatedTokens.toLocaleString()} / 25,000 Tokens Max
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                {analysisResult.tokenEfficiencyAudit.headroomPercent}% Headroom
              </span>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCompleteReport}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                {copiedReport ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Brief</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Full Brief</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Academic Markdown</span>
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {analysisResult ? (
          <div className="space-y-8">
            {/* Step 1: Core Concept Extraction (<300 words) */}
            <CoreConceptView
              coreConcept={analysisResult.coreConcept}
              paperTitle={analysisResult.paperTitle}
              paperAuthors={analysisResult.paperAuthors}
              yearOrVenue={analysisResult.yearOrVenue}
              paperUrl={analysisResult.paperUrl}
            />

            {/* Step 2: Architectural Flowchart (Mermaid.js graph TD) */}
            <MermaidViewer
              mermaidCode={analysisResult.mermaidCode}
              flowchartSegment={analysisResult.flowchartSegment}
              paperTitle={analysisResult.paperTitle}
            />

            {/* Step 3: Future Work & 3rd-Year CS Student Internship Opportunities */}
            <InternshipOpportunitiesView
              opportunities={analysisResult.internshipOpportunities}
              paperTitle={analysisResult.paperTitle}
              onOpenScaffold={handleOpenScaffold}
            />
          </div>
        ) : !isLoading ? (
          /* Empty / Call-to-action state */
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              No Paper Loaded Yet
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Select one of the landmark papers above or enter any arXiv URL to extract core concepts, graph TD Mermaid architectures, and resume engineering projects.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {samplePapers.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white hover:bg-slate-850 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Try &ldquo;{sample.title.split(':')[0]}&rdquo;</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ArXivArch</span>
            <span>&bull;</span>
            <span>Token-Constrained Computer Science Research Agent</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Operational limit: &lt; 25,000 tokens</span>
            <span>&bull;</span>
            <span>Syntactically Valid Mermaid.js (graph TD)</span>
          </div>
        </div>
      </footer>

      {/* GitHub Repo Scaffold Modal */}
      <ScaffoldModal
        isOpen={scaffoldState.isOpen}
        onClose={() => setScaffoldState((prev) => ({ ...prev, isOpen: false }))}
        opportunity={scaffoldState.opportunity}
        scaffoldData={scaffoldState.scaffoldData}
        isLoading={scaffoldState.isLoading}
        paperTitle={analysisResult?.paperTitle || 'CS Research Project'}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={(item) => setAnalysisResult(item)}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('arxivarch_history');
        }}
      />
    </div>
  );
}
