/**
 * Servicios para compartir quizzes
 */

import { QuizAPI, SharedQuizInfo, ShareCodeResponse } from '../types/api';
import { API_URL, getAuthHeaders } from './config';

// ==================== SHARE ENDPOINTS ====================

// Generar código para compartir un quiz
export const generateShareCode = async (quizId: number): Promise<ShareCodeResponse> => {
  const response = await fetch(`${API_URL}/share/${quizId}/generate-code`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al generar código');
  }

  return response.json();
};

// Revocar código de compartir
export const revokeShareCode = async (quizId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/share/${quizId}/revoke-code`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al revocar código');
  }
};

// Obtener información de un quiz por código
export const getQuizInfoByCode = async (shareCode: string): Promise<SharedQuizInfo> => {
  const response = await fetch(`${API_URL}/share/code/${shareCode.toUpperCase()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Código inválido');
  }

  return response.json();
};

// Obtener quiz completo por código (para jugarlo)
export const getSharedQuizFull = async (shareCode: string): Promise<QuizAPI> => {
  const response = await fetch(`${API_URL}/share/code/${shareCode.toUpperCase()}/full`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Quiz no encontrado');
  }

  return response.json();
};

// Obtener mis quizzes compartidos
export const getMySharedQuizzes = async (): Promise<SharedQuizInfo[]> => {
  const response = await fetch(`${API_URL}/share/my-shared`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener quizzes compartidos');
  }

  return response.json();
};
