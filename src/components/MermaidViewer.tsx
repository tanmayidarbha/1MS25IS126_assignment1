import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Download,
  Code,
  Eye,
  Maximize2,
  AlertCircle,
  Network,
} from 'lucide-react';

interface MermaidViewerProps {
  mermaidCode: string;
  flowchartSegment: string;
  paperTitle?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  mermaidCode,
  flowchartSegment,
  paperTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSegment, setCopiedSegment] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'rawText' | 'mermaidCode'>('diagram');

  // Initialize mermaid with dark styling
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        background: '#0b0f19',
        primaryColor: '#312e81',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#6366f1',
        lineColor: '#818cf8',
        secondaryColor: '#1e1b4b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
      },
      flowchart: {
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 50,
        htmlLabels: true,
      },
    });
  }, []);

  // Render diagram whenever mermaidCode changes
  useEffect(() => {
    if (!mermaidCode) {
      setSvgContent('');
      return;
    }

    let isMounted = true;
    const cleanCode = mermaidCode
      .replace(/```mermaid/gi, '')
      .replace(/```/g, '')
      .trim();

    // Ensure it starts with graph or flowchart
    let finalCode = cleanCode;
    if (!finalCode.startsWith('graph ') && !finalCode.startsWith('flowchart ')) {
      finalCode = `graph TD\n${finalCode}`;
    }

    const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    mermaid
      .render(uniqueId, finalCode)
      .then(({ svg }) => {
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      })
      .catch((err) => {
        console.warn('Mermaid rendering error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Mermaid syntax error. Viewing raw code instead.');
          // Auto switch to raw code view if diagram fails
          setViewMode('mermaidCode');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [mermaidCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySegment = async () => {
    try {
      await navigator.clipboard.writeText(flowchartSegment);
      setCopiedSegment(true);
      setTimeout(() => setCopiedSegment(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(paperTitle || 'system-architecture').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-flowchart.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
                Architectural Flowchart
              </h3>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-300 border border-indigo-500/20">
                Mermaid.js (graph TD)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Components, data inputs, model layers, and data outputs
            </p>
          </div>
        </div>

        {/* View toggles & actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
                viewMode === 'diagram'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('rawText')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
                viewMode === 'rawText'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View formatted text segment labeled [FLOWCHART]"
            >
              <Code className="h-3.5 w-3.5" />
              <span>[FLOWCHART] Text</span>
            </button>
            <button
              onClick={() => setViewMode('mermaidCode')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition font-medium ${
                viewMode === 'mermaidCode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Mermaid Code</span>
            </button>
          </div>

          {/* Zoom controls (only in diagram mode) */}
          {viewMode === 'diagram' && svgContent && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Download SVG */}
          {svgContent && viewMode === 'diagram' && (
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
              title="Download SVG"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">SVG</span>
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={viewMode === 'rawText' ? handleCopySegment : handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            {(viewMode === 'rawText' ? copiedSegment : copiedCode) ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{viewMode === 'rawText' ? 'Copy [FLOWCHART]' : 'Copy Code'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative min-h-[380px] max-h-[640px] overflow-auto bg-slate-950/80 p-6">
        {viewMode === 'diagram' ? (
          renderError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="font-medium text-slate-200">Diagram Visualization Notice</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-md">{renderError}</p>
              <button
                onClick={() => setViewMode('mermaidCode')}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Inspect Mermaid Syntax
              </button>
            </div>
          ) : svgContent ? (
            <div
              className="flex justify-center transition-transform duration-150 origin-top"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div
                ref={containerRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto drop-shadow-md"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
              Rendering architectural diagram...
            </div>
          )
        ) : viewMode === 'rawText' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-mono text-indigo-400 font-semibold">[FLOWCHART] Output Format</span>
              <span>Exact label format specified in operational constraints</span>
            </div>
            <pre className="font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 overflow-x-auto selection:bg-indigo-500/40">
              {flowchartSegment}
            </pre>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-mono text-indigo-300">Pure Mermaid.js (graph TD)</span>
              <span>Ready for GitHub, Notion, or Obsidian markdown</span>
            </div>
            <pre className="font-mono text-xs text-indigo-200/90 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 overflow-x-auto">
              {mermaidCode}
            </pre>
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-5 py-2.5 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Data Inputs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
            <span>Model Layers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400"></span>
            <span>Components & Normalization</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Data Outputs</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Use zoom controls or export as SVG for presentations
        </span>
      </div>
    </div>
  );
};
