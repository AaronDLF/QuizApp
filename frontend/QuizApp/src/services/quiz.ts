/**
 * Servicios de quizzes y preguntas
 */

import { QuizAPI, QuizListAPI, QuestionAPI, ChoiceAPI } from '../types/api';
import { API_URL, getAuthHeaders, handleFetchError } from './config';

// ==================== QUIZ ENDPOINTS ====================

// Obtener todos los quizzes (lista resumida)
export const getAllQuizzes = async (): Promise<QuizListAPI[]> => {
  try {
    const response = await fetch(`${API_URL}/quizzes/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // Si es 401, el token expiró o es inválido
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      }
      throw new Error('Error al obtener quizzes');
    }

    return response.json();
  } catch (err) {
    return handleFetchError(err);
  }
};

// Obtener un quiz con todas sus preguntas
export const getQuiz = async (id: number): Promise<QuizAPI> => {
  const response = await fetch(`${API_URL}/quizzes/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Quiz no encontrado');
  return response.json();
};

// Crear un nuevo quiz
export const createQuiz = async (title: string): Promise<QuizAPI> => {
  const response = await fetch(`${API_URL}/quizzes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear quiz');
  }

  return response.json();
};

// Actualizar título de un quiz
export const updateQuiz = async (id: number, title: string): Promise<QuizAPI> => {
  const response = await fetch(`${API_URL}/quizzes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al actualizar quiz');
  }

  return response.json();
};

// Eliminar un quiz
export const deleteQuiz = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/quizzes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar quiz');
  }
};

// ==================== QUESTION ENDPOINTS ====================

// Agregar pregunta a un quiz
export const addQuestionToQuiz = async (
  quizId: number,
  question: { question_text: string; choices: ChoiceAPI[] }
): Promise<QuestionAPI> => {
  const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar pregunta');
  }

  return response.json();
};

// Actualizar una pregunta
export const updateQuestion = async (
  questionId: number,
  question: { question_text: string; answer_type: string; choices: ChoiceAPI[] }
): Promise<QuestionAPI> => {
  const response = await fetch(`${API_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al actualizar pregunta');
  }

  return response.json();
};

// Eliminar una pregunta
export const deleteQuestion = async (questionId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar pregunta');
  }
};
