export interface CoreConcept {
  problemStatement: string;
  primaryMethodology: string;
  keyBreakthroughs: string;
  plainLanguageSummary: string;
  wordCount?: number;
}

export interface InternshipOpportunity {
  title: string;
  exactExtension: string;
  targetedMetric: string;
  recommendedTechStack: string[];
  difficultyLevel?: string;
  implementationSteps: string[];
  resumeBulletTemplate: string;
}

export interface OpenSourceRepo {
  name: string;
  url: string;
  description: string;
}

export interface TokenEfficiencyAudit {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  totalEstimatedTokens: number;
  tokenBudgetConstraint: number;
  headroomPercent: number;
  status: string;
  notes: string;
}

export interface AnalysisResult {
  paperTitle: string;
  paperAuthors?: string[];
  yearOrVenue?: string;
  paperUrl?: string;
  coreConcept: CoreConcept;
  flowchartSegment: string;
  mermaidCode: string;
  internshipOpportunities: InternshipOpportunity[];
  openSourceImplementations?: OpenSourceRepo[];
  tokenEfficiencyAudit: TokenEfficiencyAudit;
}

export interface SamplePaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url: string;
  category: string;
  abstract: string;
}

export interface ProjectScaffold {
  projectSlug: string;
  fileTree: string;
  readmeMarkdown: string;
  starterScript: {
    filename: string;
    code: string;
    description?: string;
  };
  evaluationProtocol: string;
}
