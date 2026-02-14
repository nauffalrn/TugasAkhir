export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  badge_label: string;
  content_images: string[];
  sort_order: number;
}

export interface Question {
  id: string;
  topic_id: string;
  level: number;
  prompt: string;
  options: string[];
  correct_index: number;
  hint: string | null;
  explanation: string | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id: string;
  level: number;
  time_limit_seconds: number | null;
  started_at: string;
  submitted_at: string | null;
  total_questions: number;
  correct_count: number | null;
  score: number | null;
}

export interface UserTopicProgress {
  user_id: string;
  topic_id: string;
  highest_level_unlocked: number;
  best_score_l1: number | null;
  best_score_l2: number | null;
  best_score_l3: number | null;
  best_score_l4: number | null;
  updated_at: string;
}