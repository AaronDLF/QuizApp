/**
 * Servicios - Punto de entrada
 */

// Re-exportar todo desde api.ts para mantener compatibilidad
export * from './api';

// También exportar los módulos individuales para imports más específicos
export * as authService from './auth';
export * as quizService from './quiz';
export * as shareService from './share';
export * as configService from './config';
