/**
 * Hook para manejo de autenticación
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadTokenFromStorage,
  getToken,
  isTokenLoaded,
  login as apiLogin,
  register as apiRegister,
  getCurrentUser as apiGetCurrentUser,
  logout as apiLogout,
} from '../services/api';
import { UserAPI, LoginData, RegisterData } from '../types/api';

interface UseAuthReturn {
  user: UserAPI | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<UserAPI>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar: cargar token y verificar sesión
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadTokenFromStorage();
        const token = getToken();

        if (token) {
          try {
            const currentUser = await apiGetCurrentUser();
            setUser(currentUser);
          } catch {
            // Token inválido o expirado
            await apiLogout();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isTokenLoaded()) {
      initialize();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiLogin(data);
      const currentUser = await apiGetCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<UserAPI> => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await apiRegister(data);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await apiGetCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
};
