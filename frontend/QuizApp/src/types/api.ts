/**
 * Tipos relacionados con las respuestas y peticiones de la API
 */

// ==================== AUTH TYPES ====================

export interface UserAPI {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// ==================== QUIZ TYPES ====================

export interface ChoiceAPI {
  id?: number;
  choice_text: string;
  is_correct: boolean;
  question_id?: number;
}

export interface QuestionAPI {
  id?: number;
  question_text: string;
  answer_type?: string;  // "text" | "options"
  quiz_id?: number;
  choices: ChoiceAPI[];
}

export interface QuizAPI {
  id: number;
  title: string;
  created_at: string;
  questions: QuestionAPI[];
}

export interface QuizListAPI {
  id: number;
  title: string;
  created_at: string;
  question_count: number;
}

// ==================== SHARE TYPES ====================

export interface SharedQuizInfo {
  id: number;
  title: string;
  created_at: string;
  owner_name: string;
  question_count: number;
  share_code: string | null;
}

export interface ShareCodeResponse {
  share_code: string;
  message: string;
}
