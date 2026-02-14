export interface User {
  id: string;
  email: string;
  username: string | null;
}

export interface Topic {
  slug: string;
  title: string;
  badge_label: string;
  content_images: string[];
  sort_order: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  hint: string | null;
}

export interface QuizAttempt {
  attempt_id: string;
  time_limit_seconds: number | null;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  correct_count: number;
  total_questions: number;
  review: Array<{
    question_id: string;
    selected_index: number;
    correct_index: number;
    is_correct: boolean;
    explanation: string | null;
  }>;
  unlocked_next_level: boolean;
  badge_earned: boolean;
}

export interface Badge {
  level: number;
  earned_at: string;
  topic_id: string;
  title: string;
  icon_key: string;
}

export interface UserProfile {
  user: User;
  stats: {
    total_questions_answered: number;
  };
}