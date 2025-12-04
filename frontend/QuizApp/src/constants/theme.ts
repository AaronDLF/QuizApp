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

// Espaciados
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Radios de borde
export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  round: 9999,
};

// Tamaños de fuente
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 17,
  xxl: 18,
  title: 20,
  heading: 24,
  display: 32,
};

// Pesos de fuente
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
