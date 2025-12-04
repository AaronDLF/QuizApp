/**
 * Tipos e interfaces para props de componentes
 */

import { AnswerType, Card, Quiz, QuizConfig, QuizResult } from './index';
import { QuizAPI } from './api';

// ==================== THEME ====================

export interface ThemeColors {
  background: string;
  cardBackground: string;
  modalBackground: string;
  overlay: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDimmed: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  border: string;
  borderLight: string;
  borderMedium: string;
  borderStrong: string;
}

// ==================== USER ====================

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

// ==================== QUIZ COMPONENTS ====================

export interface QuizListProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onPlayQuiz: (quiz: Quiz) => void;
  onShareQuiz?: (quiz: Quiz) => void;
  colors?: ThemeColors;
}

export interface CardListProps {
  cards: Card[];
  onSelectCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  colors?: ThemeColors;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  colors?: ThemeColors;
}

export interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export interface FABProps {
  onPress: () => void;
  colors?: ThemeColors;
}

// ==================== MODALS ====================

export interface NewQuizModalProps {
  visible: boolean;
  title: string;
  onTitleChange: (text: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export interface NewCardModalProps {
  visible: boolean;
  question: string;
  onQuestionChange: (text: string) => void;
  answerType: AnswerType;
  onAnswerTypeChange: (type: AnswerType) => void;
  textAnswer: string;
  onTextAnswerChange: (text: string) => void;
  options: string[];
  onOptionChange: (index: number, text: string) => void;
  correctOption: number;
  onCorrectOptionChange: (index: number) => void;
  onCancel: () => void;
  onAdd: () => void;
}

export interface CardDetailModalProps {
  visible: boolean;
  card: Card | null;
  onClose: () => void;
  onEdit: () => void;
}

export interface EditCardModalProps {
  visible: boolean;
  question: string;
  onQuestionChange: (text: string) => void;
  answerType: AnswerType;
  onAnswerTypeChange: (type: AnswerType) => void;
  textAnswer: string;
  onTextAnswerChange: (text: string) => void;
  options: string[];
  onOptionChange: (index: number, text: string) => void;
  correctOption: number;
  onCorrectOptionChange: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
}

// ==================== QUIZ RUNNER ====================

export interface QuizRunnerProps {
  visible: boolean;
  quizTitle: string;
  cards: Card[];
  config: QuizConfig;
  onFinish: (result: QuizResult) => void;
  onCancel: () => void;
}

export interface QuizConfigModalProps {
  visible: boolean;
  quizTitle: string;
  cardCount: number;
  onStart: (config: QuizConfig) => void;
  onCancel: () => void;
}

export interface QuizResultModalProps {
  visible: boolean;
  result: QuizResult | null;
  onClose: () => void;
  onRetry: () => void;
}

// ==================== SHARE ====================

export interface ShareModalProps {
  visible: boolean;
  quizId: number;
  quizTitle: string;
  onClose: () => void;
}

export interface JoinQuizModalProps {
  visible: boolean;
  onJoinSuccess: (quiz: QuizAPI, ownerName?: string) => void;
  onClose: () => void;
}
