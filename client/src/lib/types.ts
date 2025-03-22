export interface User {
  id: number;
  username: string;
}

export type FeedbackRating = 'nervous' | 'okay' | 'confident';

export interface PracticeSession {
  id: number;
  date: string;
  duration: number;
  promptCategory: string;
  prompt: string;
  filter: string;
  confidenceScore: number;
  userRating?: FeedbackRating;
  aiNotes?: AIFeedback;
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
}
