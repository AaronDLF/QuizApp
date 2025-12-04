/**
 * Utilidades generales de la aplicación
 */

/**
 * Mezcla un array usando el algoritmo Fisher-Yates
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Formatea segundos a formato mm:ss
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formatea segundos a formato "Xm Ys"
 */
export const formatTimeVerbose = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

/**
 * Formatea una fecha ISO a formato legible en español
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Valida el tiempo ingresado en minutos
 */
export const validateTimeInput = (value: string): {
  valid: boolean;
  seconds: number | null;
  error: string | null
} => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { valid: false, seconds: null, error: 'Ingresa un tiempo válido' };
  }

  // Reemplazar coma por punto para soportar ambos formatos decimales
  const normalized = trimmed.replace(',', '.');
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    return { valid: false, seconds: null, error: 'Ingresa un número válido' };
  }

  if (parsed <= 0) {
    return { valid: false, seconds: null, error: 'El tiempo debe ser mayor a 0' };
  }

  if (parsed > 999) {
    return { valid: false, seconds: null, error: 'El tiempo máximo es 999 minutos' };
  }

  // Convertir minutos a segundos (soportando decimales)
  const seconds = Math.round(parsed * 60);
  return { valid: true, seconds, error: null };
};

/**
 * Obtiene un emoji basado en el puntaje
 */
export const getScoreEmoji = (score: number): string => {
  if (score >= 90) return '🏆';
  if (score >= 70) return '🎉';
  if (score >= 50) return '👍';
  if (score >= 30) return '📚';
  return '💪';
};

/**
 * Obtiene un mensaje basado en el puntaje
 */
export const getScoreMessage = (score: number): string => {
  if (score >= 90) return '¡Excelente! Dominas este tema';
  if (score >= 70) return '¡Muy bien! Buen conocimiento';
  if (score >= 50) return 'Bien, pero puedes mejorar';
  if (score >= 30) return 'Necesitas repasar más';
  return 'Sigue practicando';
};
