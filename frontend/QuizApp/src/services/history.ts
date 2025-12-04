/**
 * Servicios para el historial de quizzes
 */

import { API_URL, getAuthHeaders } from './config';

// ==================== HISTORY TYPES ====================

export interface QuizHistoryCreate {
  quiz_id?: number | null;
  quiz_title: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent: number;
  is_external: boolean;
  owner_name?: string | null;
}

export interface QuizHistoryEntry {
  id: number;
  quiz_id: number | null;
  quiz_title: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent: number;
  is_external: boolean;
  owner_name: string | null;
  completed_at: string;
}

export interface UserStats {
  total_quizzes: number;
  average_score: number;
  total_correct: number;
  total_questions: number;
  total_time: number;
  external_quizzes: number;
}

// ==================== HISTORY ENDPOINTS ====================

// Guardar resultado de un quiz completado
export const saveQuizResult = async (data: QuizHistoryCreate): Promise<QuizHistoryEntry> => {
  const response = await fetch(`${API_URL}/history/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al guardar resultado');
  }

  return response.json();
};

// Obtener historial del usuario
export const getMyHistory = async (limit: number = 50): Promise<QuizHistoryEntry[]> => {
  const response = await fetch(`${API_URL}/history/?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener historial');
  }

  return response.json();
};

// Obtener estadísticas del usuario
export const getMyStats = async (): Promise<UserStats> => {
  const response = await fetch(`${API_URL}/history/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener estadísticas');
  }

  return response.json();
};

// Eliminar una entrada del historial
export const deleteHistoryEntry = async (historyId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/history/${historyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar entrada');
  }
};
