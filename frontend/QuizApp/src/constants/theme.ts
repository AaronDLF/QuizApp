import { Dimensions, PixelRatio, Platform } from 'react-native';

// Dimensiones de referencia (iPhone 11)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Escalar según ancho de pantalla
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Usar el menor para mantener proporciones, pero con límites
const scale = Math.max(0.85, Math.min(widthScale, heightScale, 1.3));

// Función para escalar tamaños de forma responsiva
export const normalize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Escalar solo ancho
export const wp = (percentage: number): number => {
  return SCREEN_WIDTH * (percentage / 100);
};

// Escalar solo alto
export const hp = (percentage: number): number => {
  return SCREEN_HEIGHT * (percentage / 100);
};

// Tema Oscuro
export const darkTheme = {
  // Fondos
  background: '#1E1E2E',
  cardBackground: 'rgba(255, 255, 255, 0.08)',
  modalBackground: '#2A2A3E',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Texto
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textDimmed: 'rgba(255, 255, 255, 0.4)',

  // Acentos
  primary: '#6366F1',
  primaryLight: 'rgba(99, 102, 241, 0.3)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.2)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.2)',

  // Bordes
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderMedium: 'rgba(255, 255, 255, 0.2)',
  borderStrong: 'rgba(255, 255, 255, 0.3)',
};

// Tema Claro
export const lightTheme = {
  // Fondos
  background: '#F5F5F7',
  cardBackground: '#FFFFFF',
  modalBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Texto
  textPrimary: '#1E1E2E',
  textSecondary: 'rgba(30, 30, 46, 0.7)',
  textMuted: 'rgba(30, 30, 46, 0.5)',
  textDimmed: 'rgba(30, 30, 46, 0.4)',

  // Acentos
  primary: '#6366F1',
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',

  // Bordes
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.06)',
  borderMedium: 'rgba(0, 0, 0, 0.12)',
  borderStrong: 'rgba(0, 0, 0, 0.2)',
};

// Colores por defecto (oscuro) - para compatibilidad
export const colors = darkTheme;

// Espaciados (responsivos)
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(20),
  xxl: normalize(24),
};

// Radios de borde (responsivos)
export const borderRadius = {
  sm: normalize(8),
  md: normalize(10),
  lg: normalize(12),
  xl: normalize(14),
  xxl: normalize(16),
  round: 9999,
};

// Tamaños de fuente (responsivos)
export const fontSize = {
  xs: normalize(12),
  sm: normalize(13),
  md: normalize(15),
  base: normalize(16),
  lg: normalize(17),
  xl: normalize(18),
  xxl: normalize(20),
  title: normalize(22),
  heading: normalize(26),
  display: normalize(36),
};

// Pesos de fuente
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
