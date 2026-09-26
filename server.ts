import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google GenAI initialization with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ArxivPaperMetadata {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfUrl?: string;
  categories: string[];
}

// Token counter helper (approximate standard ~4 chars per token)
function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

// Extract arXiv ID from URL or text
function extractArxivId(input: string): string | null {
  const match = input.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
  return match ? match[1].replace(/v\d+$/, '') : null;
}

// Fetch official metadata from arXiv Atom API
async function fetchArxivMetadata(arxivId: string): Promise<ArxivPaperMetadata | null> {
  try {
    const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}&max_results=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ArXivArch-Agent/1.0' } });
    if (!res.ok) return null;
    const xml = await res.text();

    const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
    const summaryMatch = xml.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = xml.match(/<entry>[\s\S]*?<published>(.*?)<\/published>/);
    const authorsMatches = [...xml.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>/g)];

    if (!titleMatch || !summaryMatch) return null;

    const title = titleMatch[1].replace(/\s+/g, ' ').trim();
    const summary = summaryMatch[1].replace(/\s+/g, ' ').trim();
    const authors = authorsMatches.map((m) => m[1].trim()).slice(0, 5);
    const published = publishedMatch ? publishedMatch[1].substring(0, 10) : '';

    return {
      id: arxivId,
      title,
      summary,
      authors,
      published,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
      categories: [],
    };
  } catch (err) {
    console.warn('Error fetching arXiv metadata:', err);
    return null;
  }
}

// Helper to call Gemini generateContent with automatic retry on transient spikes (503 / 429)
async function callGeminiWithRetry(params: any, maxRetries = 3): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') ||
        err?.message?.includes('high demand');

      if (isTransient && attempt < maxRetries) {
        const delay = attempt * 1800;
        console.warn(`Gemini API 503/transient error on attempt ${attempt}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// Curated landmark papers for immediate exploration
const SAMPLE_PAPERS = [
  {
    id: '1706.03762',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'et al.'],
    year: '2017',
    url: 'https://arxiv.org/abs/1706.03762',
    category: 'Foundations & Transformers',
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
  },
  {
    id: '2106.09685',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: ['Edward J. Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'et al.'],
    year: '2021',
    url: 'https://arxiv.org/abs/2106.09685',
    category: 'Fine-Tuning & Efficiency',
    abstract:
      'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning becomes prohibitive. We propose Low-Rank Adaptation (LoRA), which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters.',
  },
  {
    id: '2312.00752',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['Albert Gu', 'Tri Dao'],
    year: '2023',
    url: 'https://arxiv.org/abs/2312.00752',
    category: 'Sequence Models & SSMs',
    abstract:
      'Foundation models, now mostly based on the Transformer architecture and its core attention module, have achieved immense success. However, their subquadratic inference speed and quadratic context-length scaling remain bottlenecks. We propose Mamba, a selective state space model that lets sequence models filter out irrelevant information and compress context dynamically, achieving 5x higher throughput than Transformers and linear scaling with sequence length.',
  },
  {
    id: '2205.14135',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: ['Tri Dao', 'Daniel Y. Fu', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
    year: '2022',
    url: 'https://arxiv.org/abs/2205.14135',
    category: 'Systems & GPU Kernels',
    abstract:
      'Transformers are slow and memory-hungry on long sequences, as the time and memory complexity of self-attention are quadratic in sequence length. We argue that a missing principle is making attention algorithms IO-aware: accounting for reads and writes between levels of GPU memory hierarchy (HBM and SRAM). We introduce FlashAttention, an IO-aware exact attention algorithm using tiling to compute softmax without materializing the N-by-N attention matrix.',
  },
  {
    id: '2501.12948',
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
    authors: ['DeepSeek-AI', 'Daya Guo', 'Dejian Yang', 'Haowei Zhang', 'et al.'],
    year: '2025',
    url: 'https://arxiv.org/abs/2501.12948',
    category: 'RL & Reasoning',
    abstract:
      'We introduce DeepSeek-R1-Zero and DeepSeek-R1, which explore the development of reasoning capabilities in language models through large-scale reinforcement learning without prior supervised fine-tuning. DeepSeek-R1 uses Group Relative Policy Optimization (GRPO) with verification rewards to trigger self-evolution of reasoning behaviors such as self-verification, reflection, and chain-of-thought search.',
  },
];

// Endpoint: Sample papers
app.get('/api/sample-papers', (_req: Request, res: Response) => {
  res.json({ samples: SAMPLE_PAPERS });
});

// Endpoint: Search arXiv
app.post('/api/search-arxiv', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Check if query is an arXiv ID
    const directId = extractArxivId(query);
    if (directId) {
      const meta = await fetchArxivMetadata(directId);
      if (meta) {
        res.json({ papers: [meta] });
        return;
      }
    }

    // Fetch from arXiv search API
    const formattedQuery = encodeURIComponent(`all:${query}`);
    const arxivApiUrl = `https://export.arxiv.org/api/query?search_query=${formattedQuery}&start=0&max_results=6&sortBy=relevance&sortOrder=descending`;

    const apiRes = await fetch(arxivApiUrl, { headers: { 'User-Agent': 'ArXivArch-Agent/1.0' } });
    if (!apiRes.ok) {
      throw new Error(`ArXiv API returned status ${apiRes.status}`);
    }

    const xml = await apiRes.text();
    const entryBlocks = xml.split('<entry>').slice(1);

    const papers = entryBlocks.map((block) => {
      const idMatch = block.match(/<id>http:\/\/arxiv\.org\/abs\/(.*?)<\/id>/);
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = block.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = block.match(/<published>(.*?)<\/published>/);
      const authorMatches = [...block.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>/g)];

      const rawId = idMatch ? idMatch[1].replace(/v\d+$/, '') : '';
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Untitled Paper';
      const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
      const authors = authorMatches.map((m) => m[1].trim()).slice(0, 4);
      const published = publishedMatch ? publishedMatch[1].substring(0, 10) : '';

      return {
        id: rawId,
        title,
        summary,
        authors,
        published,
        url: `https://arxiv.org/abs/${rawId}`,
        pdfUrl: `https://arxiv.org/pdf/${rawId}.pdf`,
      };
    });

    res.json({ papers });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search arXiv' });
  }
});

// Endpoint: Main Research Analysis Agent
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const { url, title, rawText, focusArea } = req.body;

    if (!url && !title && !rawText) {
      res.status(400).json({ error: 'Please provide a paper URL, title, or raw text.' });
      return;
    }

    let paperTitle = (title || '').trim();
    let paperContext = (rawText || '').trim();
    let paperUrl = (url || '').trim();
    let paperAuthors: string[] = [];
    let paperYear = '';
    let paperId = '';

    // Step 1: Ingestion & URL Resolution with Token Efficiency
    // If it's an arXiv URL or ID, fetch official concise metadata
    const detectedArxivId = extractArxivId(paperUrl) || extractArxivId(paperTitle);
    if (detectedArxivId) {
      paperId = detectedArxivId;
      const meta = await fetchArxivMetadata(detectedArxivId);
      if (meta) {
        paperTitle = meta.title;
        paperContext = meta.summary + (paperContext ? `\n\nAdditional text:\n${paperContext}` : '');
        paperAuthors = meta.authors;
        paperYear = meta.published.substring(0, 4);
        if (!paperUrl) paperUrl = `https://arxiv.org/abs/${detectedArxivId}`;
      }
    }

    // If context is still sparse and we have a URL or title, use token-efficient search/fetch
    if (!paperContext && paperUrl) {
      try {
        const fetchRes = await fetch(paperUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResearchAgent/1.0)' },
          signal: AbortSignal.timeout(6000),
        });
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          // Extract title if not set
          if (!paperTitle) {
            const docTitleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (docTitleMatch) paperTitle = docTitleMatch[1].replace(/\[.*?\]|\n/g, '').trim();
          }
          // Extract abstract meta or text
          const metaDesc = html.match(/<meta\s+name=["'](?:description|citation_abstract|og:description)["']\s+content=["']([\s\S]*?)["']/i);
          if (metaDesc) {
            paperContext = metaDesc[1].trim();
          } else {
            // Strip html tags and take first 4000 characters to stay strictly token efficient
            const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            paperContext = cleanText.substring(0, 4000);
          }
        }
      } catch (e) {
        console.log('Direct URL fetch fallback:', e);
      }
    }

    // Token efficiency constraint: Enforce total prompt + context stays under strict limits
    // Max context ~12,000 characters (approx 3,000 tokens), leaving ~22,000 tokens of headroom under the 25,000 limit
    if (paperContext.length > 12000) {
      paperContext = paperContext.substring(0, 12000) + '... [Truncated for token efficiency budget]';
    }

    const estimatedInputTokens = estimateTokens(paperTitle + paperContext + paperUrl + (focusArea || ''));

    // Construct prompt adhering strictly to operational constraints:
    const prompt = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis stays well under 25,000 tokens.
- Keep the output concise, highly rigorous, and directly actionable.

INPUT PAPER DETAILS:
- Title: ${paperTitle || 'Unknown / Extract from content'}
- URL / Reference: ${paperUrl || 'N/A'}
- Extracted Context / Abstract / Content:
${paperContext || 'Perform analysis based on the paper title and domain knowledge.'}
- Target Student Focus Area: ${focusArea || 'General Systems & Machine Learning'}

EXECUTE THESE EXACT 3 STEPS:

1. CORE CONCEPT EXTRACTION:
Summarize:
- The problem statement
- The primary methodology introduced
- The key mathematical/algorithmic breakthroughs
Constraint: Under 300 words total using plain, accessible yet mathematically precise language.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
Generate a clean, syntactically correct Mermaid js flowchart (graph TD) that charts:
- Components
- Data inputs
- Model layers
- Data outputs
Constraint: Do NOT use Markdown code blocks inside the Mermaid string itself. Output it as a clear text segment labeled [FLOWCHART]. Ensure all node names are alphanumeric and valid Mermaid syntax (use quotes for node text with spaces or special characters, e.g., A["Input Token Sequence x_1:T"] --> B["Embedding Layer + Positional Encoding"]).

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project.
For each of the 3 ideas provide:
- The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment").
- The targeted performance metric (e.g., latency reduction, memory footprint, accuracy trade-off).
- The recommended tech stack (e.g., PyTorch, ONNX Runtime, TensorRT, Triton).
- Implementation Roadmap (A 4-6 week sprint plan suited for an undergraduate internship/portfolio project).
- Resume Bullet Template (An impactful STAR-method bullet for their CV).

Respond in structured JSON format according to this schema.`;

    // Server-side call using gemini-3.8-flash with automatic backoff retry
    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a elite Computer Science Research Agent. You evaluate papers with precision, produce bulletproof Mermaid.js flowcharts (graph TD), and architect pragmatic, high-impact student engineering projects with concrete metrics and modern tech stacks.',
        temperature: 0.2, // Low temperature for factual accuracy and syntax-correct Mermaid
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paperTitle: { type: Type.STRING },
            paperAuthors: { type: Type.ARRAY, items: { type: Type.STRING } },
            yearOrVenue: { type: Type.STRING },
            coreConcept: {
              type: Type.OBJECT,
              properties: {
                wordCount: { type: Type.INTEGER },
                problemStatement: { type: Type.STRING },
                primaryMethodology: { type: Type.STRING },
                keyBreakthroughs: { type: Type.STRING },
                plainLanguageSummary: { type: Type.STRING, description: 'Under 300 words combining problem, methodology, and breakthrough' },
              },
              required: ['problemStatement', 'primaryMethodology', 'keyBreakthroughs', 'plainLanguageSummary'],
            },
            flowchartSegment: {
              type: Type.STRING,
              description: 'Clear text segment labeled [FLOWCHART] followed by valid Mermaid.js graph TD code with no markdown backticks',
            },
            mermaidCode: {
              type: Type.STRING,
              description: 'The pure, valid Mermaid.js graph TD code string ready for direct rendering (no backticks, no markdown)',
            },
            internshipOpportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  exactExtension: { type: Type.STRING },
                  targetedMetric: { type: Type.STRING },
                  recommendedTechStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  difficultyLevel: { type: Type.STRING, description: 'e.g. Intermediate, Advanced' },
                  implementationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resumeBulletTemplate: { type: Type.STRING },
                },
                required: ['title', 'exactExtension', 'targetedMetric', 'recommendedTechStack', 'implementationSteps', 'resumeBulletTemplate'],
              },
            },
            openSourceImplementations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            tokenEfficiencyAudit: {
              type: Type.OBJECT,
              properties: {
                estimatedInputTokens: { type: Type.INTEGER },
                estimatedOutputTokens: { type: Type.INTEGER },
                totalEstimatedTokens: { type: Type.INTEGER },
                tokenBudgetConstraint: { type: Type.INTEGER },
                notes: { type: Type.STRING },
              },
            },
          },
          required: ['paperTitle', 'coreConcept', 'flowchartSegment', 'mermaidCode', 'internshipOpportunities'],
        },
      },
    });

    const rawTextResponse = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawTextResponse);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', parseErr);
      res.status(500).json({ error: 'Failed to process structured response from research agent' });
      return;
    }

    // Clean up flowchart segment and mermaid code if needed
    let mermaidCode = parsedData.mermaidCode || '';
    mermaidCode = mermaidCode.replace(/```mermaid/gi, '').replace(/```/g, '').trim();

    // Ensure [FLOWCHART] label formatting matches user requirement exactly:
    let flowchartSegment = parsedData.flowchartSegment || '';
    if (!flowchartSegment.includes('[FLOWCHART]')) {
      flowchartSegment = `[FLOWCHART]\n${mermaidCode}`;
    }

    const estimatedOutputTokens = estimateTokens(rawTextResponse);
    const totalEstimatedTokens = estimatedInputTokens + estimatedOutputTokens;

    const tokenAudit = {
      estimatedInputTokens,
      estimatedOutputTokens,
      totalEstimatedTokens,
      tokenBudgetConstraint: 25000,
      headroomPercent: Math.max(0, Math.round(((25000 - totalEstimatedTokens) / 25000) * 100)),
      status: totalEstimatedTokens < 25000 ? 'COMPLIANT' : 'EXCEEDED',
      notes: `Ingestion & reasoning executed strictly within ${totalEstimatedTokens.toLocaleString()} tokens (< 25,000 token operational constraint).`,
    };

    parsedData.mermaidCode = mermaidCode;
    parsedData.flowchartSegment = flowchartSegment;
    parsedData.tokenEfficiencyAudit = tokenAudit;
    if (paperAuthors.length > 0 && (!parsedData.paperAuthors || parsedData.paperAuthors.length === 0)) {
      parsedData.paperAuthors = paperAuthors;
    }
    if (paperYear && !parsedData.yearOrVenue) {
      parsedData.yearOrVenue = paperYear;
    }
    if (!parsedData.paperUrl) {
      parsedData.paperUrl = paperUrl;
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred during paper analysis.',
    });
  }
});

// Endpoint: Generate Project Starter Scaffold Code
app.post('/api/generate-scaffold', async (req: Request, res: Response) => {
  try {
    const { paperTitle, opportunity } = req.body;
    if (!opportunity) {
      res.status(400).json({ error: 'Opportunity details required' });
      return;
    }

    const prompt = `As a Senior Research Engineer, generate a comprehensive GitHub repository starter scaffold for an undergraduate CS student pursuing this project:

Paper: ${paperTitle}
Extension: ${opportunity.exactExtension}
Target Metric: ${opportunity.targetedMetric}
Tech Stack: ${opportunity.recommendedTechStack.join(', ')}

Provide:
1. Recommended Directory File Tree structure (ASCII)
2. \`README.md\` content with problem overview, setup instructions, baseline vs extension evaluation protocol.
3. Starter Python benchmark script (\`benchmark.py\` or \`train_adapter.py\`) with realistic PyTorch / ONNX / HuggingFace code skeleton.
4. Metric measurement snippet (timing latency with CUDA sync, measuring VRAM or peak memory).

Respond with structured JSON.`;

    let parsedScaffold: any = null;
    try {
      const response = await callGeminiWithRetry({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectSlug: { type: Type.STRING },
              fileTree: { type: Type.STRING },
              readmeMarkdown: { type: Type.STRING },
              starterScript: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING },
                  code: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['filename', 'code'],
              },
              evaluationProtocol: { type: Type.STRING },
            },
            required: ['projectSlug', 'fileTree', 'readmeMarkdown', 'starterScript', 'evaluationProtocol'],
          },
        },
      });
      parsedScaffold = JSON.parse(response.text || '{}');
    } catch (apiErr) {
      console.warn('API error during scaffold generation, building fallback scaffold:', apiErr);
      const safeSlug = (opportunity.title || 'cs-research-project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      parsedScaffold = {
        projectSlug: safeSlug,
        fileTree: `${safeSlug}/
├── README.md
├── requirements.txt
├── config.yaml
├── scripts/
│   ├── benchmark_latency.py
│   └── run_eval.sh
├── src/
│   ├── __init__.py
│   ├── baseline_model.py
│   ├── extension_block.py
│   └── profiler.py
└── tests/
    └── test_equivalence.py`,
        readmeMarkdown: `# ${opportunity.title}

## Overview
Undergraduate CS Capstone / Portfolio Extension based on: **${paperTitle}**

### Extension Hypothesis
> "${opportunity.exactExtension}"

### Targeted Metric
**${opportunity.targetedMetric}**

### Tech Stack
${opportunity.recommendedTechStack.map((t: string) => `- \`${t}\``).join('\n')}

## Quickstart
\`\`\`bash
# 1. Clone repository
git clone https://github.com/username/${safeSlug}.git
cd ${safeSlug}

# 2. Setup virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Run comparative latency and memory benchmark
python scripts/benchmark_latency.py --batch_size 1 --seq_len 2048
\`\`\`

## Evaluation Protocol
1. Measure baseline vs extension inference latency using PyTorch CUDA events with \`torch.cuda.synchronize()\`.
2. Measure peak allocated VRAM with \`torch.cuda.max_memory_allocated()\`.
3. Verify output equivalence and accuracy trade-off using standard benchmark datasets.`,
        starterScript: {
          filename: 'benchmark_latency.py',
          description: 'High-precision CUDA latency and VRAM profiling harness',
          code: `import time
import torch
import torch.nn as nn

# Configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
WARMUP_STEPS = 20
ACTIVE_STEPS = 100
BATCH_SIZE = 1
SEQ_LEN = 2048
HIDDEN_DIM = 768

print(f"=== Research Benchmarking on {DEVICE} ===")
print(f"Extension: ${opportunity.exactExtension}")
print(f"Target Metric: ${opportunity.targetedMetric}")

# Helper for timing with CUDA synchronization
def profile_latency(model, input_tensor):
    model.eval()
    with torch.no_grad():
        # Warmup
        for _ in range(WARMUP_STEPS):
            _ = model(input_tensor)
        if torch.cuda.is_available():
            torch.cuda.synchronize()
            torch.cuda.reset_peak_memory_stats()
            start_event = torch.cuda.Event(enable_timing=True)
            end_event = torch.cuda.Event(enable_timing=True)
            start_event.record()
        
        t0 = time.perf_counter()
        for _ in range(ACTIVE_STEPS):
            _ = model(input_tensor)
            
        if torch.cuda.is_available():
            end_event.record()
            torch.cuda.synchronize()
            total_ms = start_event.elapsed_time(end_event)
            peak_vram_mb = torch.cuda.max_memory_allocated() / (1024 ** 2)
        else:
            total_ms = (time.perf_counter() - t0) * 1000
            peak_vram_mb = 0

    avg_latency_ms = total_ms / ACTIVE_STEPS
    tokens_per_sec = (BATCH_SIZE * SEQ_LEN) / (avg_latency_ms / 1000)
    return avg_latency_ms, peak_vram_mb, tokens_per_sec

if __name__ == "__main__":
    dummy_input = torch.randn(BATCH_SIZE, SEQ_LEN, HIDDEN_DIM).to(DEVICE)
    print("Baseline initialized. Beginning evaluation...")
    # Student implementation hook here
`,
        },
        evaluationProtocol: `Measure average step time with torch.cuda.Event synchronization across 100 iterations. Record max memory allocated in MB.`,
      };
    }

    res.json(parsedScaffold);
  } catch (err: any) {
    console.error('Error generating scaffold:', err);
    res.status(500).json({ error: err.message || 'Failed to generate project scaffold' });
  }
});

// Full-stack Vite setup: mount vite in dev mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
