export interface User {
  id: number;
  username: string;
}

export type FeedbackRating = 'nervous' | 'okay' | 'confident';
export type SelfReflectionRating = 1 | 2 | 3 | 4 | 5;
export type ConfidenceTier = 'shy_starter' | 'growing_speaker' | 'confident_creator';

export interface PracticeSession {
  id: number;
  date: string;
  duration: number;
  promptCategory: string;
  prompt: string;
  filter: string;
  confidenceScore: number;
  userRating?: FeedbackRating;
  selfReflectionRating?: SelfReflectionRating;
  isCustomScript?: boolean;
  aiNotes?: AIFeedback;
  scriptUsed?: boolean;
  mode?: string;
  retries?: number;
  note?: string;
}

export interface AIFeedback {
  strengths: string[];
  improvements: string[];
  confidenceScore: number;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Prompt {
  id: number;
  category: string;
  text: string;
  teleprompterText?: string;
}

export interface FaceFilterOption {
  id: string;
  name: string;
  description: string;
}

export interface ProgressData {
  confidenceOverTime: { date: string; score: number }[];
  sessionsCompleted: number;
  streak: number;
  latestScore: number;
  selfReflectionRatings?: { date: string; rating: SelfReflectionRating }[];
}

export interface CustomScript {
  id: string;
  text: string;
  title: string;
  createdAt: string;
}

export interface UserPreferences {
  showTimer: boolean;
  enableFaceFilters: boolean;
  favoritePrompts: number[];
}