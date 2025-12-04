/**
 * Configuración base de la API y utilidades comunes
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de producción en Railway
const PRODUCTION_URL = 'https://quizapp-production-260a.up.railway.app';

// URL local para desarrollo
const LOCAL_IP = '192.168.1.9';

// Configuración de la API según entorno y plataforma
const getApiUrl = (): string => {
  // @ts-ignore - __DEV__ es una variable global de React Native
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

  // En producción (APK), siempre usar Railway
  if (!isDev) {
    return PRODUCTION_URL;
  }

  // En desarrollo, usar localhost/IP local
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }
  return `http://${LOCAL_IP}:8000`;
};

export const API_URL = getApiUrl();
export const TOKEN_KEY = 'auth_token';

// ==================== TOKEN STORAGE (PERSISTENTE) ====================

// Cache en memoria para acceso síncrono
let tokenCache: string | null = null;
let tokenLoaded = false;

// Cargar token desde AsyncStorage al iniciar (async)
export const loadTokenFromStorage = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      tokenCache = localStorage.getItem(TOKEN_KEY);
    } else {
      tokenCache = await AsyncStorage.getItem(TOKEN_KEY);
    }
    tokenLoaded = true;
    return tokenCache;
  } catch (error) {
    console.error('Error loading token:', error);
    return null;
  }
};

export const setToken = async (token: string | null): Promise<void> => {
  try {
    tokenCache = token;
    if (token) {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Obtener token de la cache (síncrono)
export const getToken = (): string | null => {
  return tokenCache;
};

// Verificar si el token ya fue cargado
export const isTokenLoaded = (): boolean => {
  return tokenLoaded;
};

// Headers con autenticación
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper para manejar errores de conexión
export const handleFetchError = (err: unknown, customMessage?: string): never => {
  if (err instanceof TypeError && (err as TypeError).message === 'Failed to fetch') {
    throw new Error(`No se puede conectar al servidor. Verifica que el backend esté corriendo en ${API_URL}`);
  }
  throw err;
};
