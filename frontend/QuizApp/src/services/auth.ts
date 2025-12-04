/**
 * Servicios de autenticación
 */

import { UserAPI, TokenResponse, LoginData, RegisterData } from '../types/api';
import { API_URL, getAuthHeaders, setToken, handleFetchError } from './config';

// ==================== AUTH ENDPOINTS ====================

export const login = async (data: LoginData): Promise<TokenResponse> => {
  try {
    // Limpiar cualquier token viejo antes de intentar login
    await setToken(null);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }

    const tokenData = await response.json();
    await setToken(tokenData.access_token);
    return tokenData;
  } catch (err) {
    return handleFetchError(err);
  }
};

export const register = async (data: RegisterData): Promise<UserAPI> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al registrar usuario');
    }

    return response.json();
  } catch (err) {
    return handleFetchError(err);
  }
};

export const getCurrentUser = async (): Promise<UserAPI> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('No autenticado');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  await setToken(null);
};
