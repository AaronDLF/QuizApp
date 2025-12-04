/**
 * Servicios API - Re-exportación centralizada
 *
 * Este archivo mantiene la compatibilidad con los imports existentes
 * mientras que la implementación está separada en archivos más pequeños.
 */

// Config y utilidades de token
export {
  API_URL,
  TOKEN_KEY,
  loadTokenFromStorage,
  setToken,
  getToken,
  isTokenLoaded,
  getAuthHeaders,
} from './config';

// Servicios de autenticación
export {
  login,
  register,
  getCurrentUser,
  logout,
} from './auth';

// Servicios de quizzes
export {
  getAllQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  updateQuestion,
  deleteQuestion,
} from './quiz';

// Servicios de compartir
export {
  generateShareCode,
  revokeShareCode,
  getQuizInfoByCode,
  getSharedQuizFull,
  getMySharedQuizzes,
} from './share';

// Servicios de historial
export {
  saveQuizResult,
  getMyHistory,
  getMyStats,
  deleteHistoryEntry,
} from './history';

// Re-exportar tipos de historial
export type {
  QuizHistoryCreate,
  QuizHistoryEntry,
  UserStats,
} from './history';

// Re-exportar tipos para compatibilidad
export type {
  UserAPI,
  TokenResponse,
  LoginData,
  RegisterData,
  ChoiceAPI,
  QuestionAPI,
  QuizAPI,
  QuizListAPI,
  SharedQuizInfo,
  ShareCodeResponse,
} from '../types/api';
