/**
 * Hook para manejo de quizzes
 */

import { useState, useCallback } from 'react';
import {
  getAllQuizzes,
  getQuiz,
  createQuiz as apiCreateQuiz,
  updateQuiz as apiUpdateQuiz,
  deleteQuiz as apiDeleteQuiz,
  addQuestionToQuiz as apiAddQuestion,
  updateQuestion as apiUpdateQuestion,
  deleteQuestion as apiDeleteQuestion,
} from '../services/api';
import { QuizAPI, QuizListAPI, QuestionAPI, ChoiceAPI } from '../types/api';

interface UseQuizzesReturn {
  quizzes: QuizListAPI[];
  currentQuiz: QuizAPI | null;
  isLoading: boolean;
  error: string | null;
  fetchQuizzes: () => Promise<void>;
  fetchQuiz: (id: number) => Promise<QuizAPI>;
  createQuiz: (title: string) => Promise<QuizAPI>;
  updateQuiz: (id: number, title: string) => Promise<QuizAPI>;
  deleteQuiz: (id: number) => Promise<void>;
  addQuestion: (quizId: number, question: { question_text: string; choices: ChoiceAPI[] }) => Promise<QuestionAPI>;
  updateQuestion: (questionId: number, question: { question_text: string; answer_type: string; choices: ChoiceAPI[] }) => Promise<QuestionAPI>;
  deleteQuestion: (questionId: number) => Promise<void>;
  clearError: () => void;
  setCurrentQuiz: (quiz: QuizAPI | null) => void;
}

export const useQuizzes = (): UseQuizzesReturn => {
  const [quizzes, setQuizzes] = useState<QuizListAPI[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar quizzes');
      // Si la sesión expiró, limpiar la lista
      if (err.message === 'Sesión expirada') {
        setQuizzes([]);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuiz = useCallback(async (id: number): Promise<QuizAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const quiz = await getQuiz(id);
      setCurrentQuiz(quiz);
      return quiz;
    } catch (err: any) {
      setError(err.message || 'Error al cargar quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createQuiz = useCallback(async (title: string): Promise<QuizAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuiz = await apiCreateQuiz(title);
      // Actualizar la lista local
      setQuizzes(prev => [...prev, {
        id: newQuiz.id,
        title: newQuiz.title,
        created_at: newQuiz.created_at,
        question_count: 0,
      }]);
      return newQuiz;
    } catch (err: any) {
      setError(err.message || 'Error al crear quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuiz = useCallback(async (id: number, title: string): Promise<QuizAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiUpdateQuiz(id, title);
      // Actualizar la lista local
      setQuizzes(prev => prev.map(q =>
        q.id === id ? { ...q, title: updated.title } : q
      ));
      if (currentQuiz?.id === id) {
        setCurrentQuiz(updated);
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentQuiz]);

  const deleteQuiz = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiDeleteQuiz(id);
      // Actualizar la lista local
      setQuizzes(prev => prev.filter(q => q.id !== id));
      if (currentQuiz?.id === id) {
        setCurrentQuiz(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentQuiz]);

  const addQuestion = useCallback(async (
    quizId: number,
    question: { question_text: string; choices: ChoiceAPI[] }
  ): Promise<QuestionAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuestion = await apiAddQuestion(quizId, question);
      // Actualizar contador en la lista
      setQuizzes(prev => prev.map(q =>
        q.id === quizId ? { ...q, question_count: q.question_count + 1 } : q
      ));
      return newQuestion;
    } catch (err: any) {
      setError(err.message || 'Error al agregar pregunta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(async (
    questionId: number,
    question: { question_text: string; answer_type: string; choices: ChoiceAPI[] }
  ): Promise<QuestionAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiUpdateQuestion(questionId, question);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar pregunta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiDeleteQuestion(questionId);
      // Actualizar contador en la lista si conocemos el quiz
      if (currentQuiz) {
        setQuizzes(prev => prev.map(q =>
          q.id === currentQuiz.id ? { ...q, question_count: Math.max(0, q.question_count - 1) } : q
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar pregunta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentQuiz]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    quizzes,
    currentQuiz,
    isLoading,
    error,
    fetchQuizzes,
    fetchQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    clearError,
    setCurrentQuiz,
  };
};
