/**
 * Tipos principales del dominio de la aplicación
 */

// Tipos de respuesta disponibles
export type AnswerType = 'text' | 'options';

// Interfaz para una Card (pregunta)
export interface Card {
  id: string;
  question: string;
  answerType: AnswerType;
  textAnswer?: string;
  options?: string[];
  correctOption?: number;
}

// Interfaz para un Quiz
export interface Quiz {
  id: string;
  title: string;
  cards: Card[];
  cardCount?: number; // Conteo de cards desde el servidor (para la lista)
}

// Configuración para ejecutar un quiz
export interface QuizConfig {
  timeLimit: number | null; // tiempo en segundos, null = sin límite
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

// Resultado de una respuesta
export interface QuizAnswer {
  cardId: string;
  userAnswer: string | number; // texto o índice de opción
  isCorrect: boolean;
  timeSpent: number; // tiempo en segundos
}

// Resultado final del quiz
export interface QuizResult {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // porcentaje
  totalTime: number;
  answers: QuizAnswer[];
}

// Re-exportar tipos de API y componentes
export * from './api';
export * from './components';
