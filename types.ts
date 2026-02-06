
export enum DocumentFormat {
  DLP_4A = 'Daily Lesson Plan (4A\'s Strategy)',
  DLP_7E = 'Daily Lesson Plan (7E\'s Strategy)',
  DLL_4A = 'Daily Lesson Log (4A\'s Framework)',
  DLL_7E = 'Daily Lesson Log (7E\'s Framework)'
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface FileData {
  name: string;
  content: string;
}

export interface PlannerState {
  format: DocumentFormat;
  school: string;
  teacher: string;
  gradeLevel: string;
  subject: string;
  topic: string; // Main topic or default
  subTopics: string[]; // List of topics for multiple plans
  numPlans: number;
  referenceFiles: FileData[];
  // Custom Overrides
  contentStandard?: string;
  performanceStandard?: string;
  learningCompetency?: string;
}

export interface GenerationResult {
  content: string;
  timestamp: number;
}
