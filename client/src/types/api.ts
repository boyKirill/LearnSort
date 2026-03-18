export type ModuleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'NEXT_STEP'
  | 'COMPARED_ELEMENTS'
  | 'PROPERTY'
  | 'COMPLEXITY'
  | 'PIVOT'
  | 'SORTED_SEGMENT';

export interface User {
  id: string;
  email: string;
  nickname: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  knowledgeCheckId: string | null;
  progress: {
    status: ModuleStatus;
    bestKnowledgeCheckPercent: number;
  };
}

export interface ModuleDetail extends ModuleSummary {
  theory: string;
  pseudocode: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    memory: string;
  };
  properties: {
    stability: string;
    inPlace: string;
    adaptivity: string;
    controlFlow: string;
  };
  advantages: string[];
  disadvantages: string[];
  usageNotes: string[];
}

export interface ProgressOverview {
  overallPercent: number;
  completedCount: number;
  totalModules: number;
  bestKnowledgePercent: number;
  modules: ModuleSummary[];
}

export interface KnowledgeCheckQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  options: Array<{
    id: string;
    text: string;
  }>;
}

export interface KnowledgeCheckPayload {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  questions: KnowledgeCheckQuestion[];
}

export interface KnowledgeAttemptResult {
  questionId: string;
  question: string;
  explanation: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string | null;
  correctOptionText: string | null;
  isCorrect: boolean;
  options: Array<{
    id: string;
    text: string;
  }>;
}

export interface KnowledgeAttemptResponse {
  id: string;
  score: number;
  maxScore: number;
  percent: number;
  moduleSlug: string;
  moduleTitle: string;
  moduleCompleted: boolean;
  results: KnowledgeAttemptResult[];
}

export interface CompareAlgorithm {
  slug: string;
  title: string;
  description: string;
}
