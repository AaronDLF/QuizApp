import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal } from 'react-native';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import { Card, QuizConfig, QuizResult, QuizAnswer } from '../types';
import { shuffleArray, formatTime, formatTimeVerbose, validateTimeInput, getScoreEmoji, getScoreMessage } from '../utils';
import type {
  QuizRunnerProps,
  QuizConfigModalProps,
  QuizResultModalProps,
} from '../types/components';

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  visible,
  quizTitle,
  cards,
  config,
  onFinish,
  onCancel,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  // Estado del quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(config.timeLimit);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [finishedByTimeout, setFinishedByTimeout] = useState(false);
  const [preparedCards, setPreparedCards] = useState<Card[]>([]);

  // Preparar las cards cuando se abre el quiz
  useEffect(() => {
    if (visible && cards.length > 0) {
      let result = [...cards];
      if (config.shuffleQuestions) {
        result = shuffleArray(result);
      }
      // Si shuffle options, crear copias con opciones mezcladas
      if (config.shuffleOptions) {
        result = result.map(card => {
          if (card.answerType === 'options' && card.options) {
            // Crear mapping de índices originales
            const originalOptions = card.options.map((opt, idx) => ({ opt, idx }));
            const shuffledOptions = shuffleArray(originalOptions);
            const newCorrectIndex = shuffledOptions.findIndex(o => o.idx === card.correctOption);
            return {
              ...card,
              options: shuffledOptions.map(o => o.opt),
              correctOption: newCorrectIndex,
            };
          }
          return card;
        });
      }
      setPreparedCards(result);
    }
  }, [visible, cards, config.shuffleQuestions, config.shuffleOptions]);

  const currentCard = preparedCards[currentIndex];
  const isLastQuestion = currentIndex === preparedCards.length - 1;

  // Timer para el tiempo total
  useEffect(() => {
    if (!visible || isFinished || preparedCards.length === 0) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
      setTotalTimeElapsed(elapsed);

      if (config.timeLimit !== null) {
        const remaining = config.timeLimit - elapsed;
        setTimeRemaining(remaining);

        if (remaining <= 0 && !isFinished) {
          // Tiempo agotado - finalizar quiz
          setFinishedByTimeout(true);
          setIsFinished(true);
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, quizStartTime, config.timeLimit, isFinished, preparedCards.length]);

  // Efecto para manejar cuando el quiz termina por TIEMPO AGOTADO solamente
  useEffect(() => {
    if (isFinished && finishedByTimeout && visible && preparedCards.length > 0) {
      // Construir resultados finales
      let finalAnswers = [...answers];

      if (currentCard) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        // Verificar si la pregunta actual tiene respuesta
        const hasAnswer = currentCard.answerType === 'options'
          ? selectedOption !== null
          : textAnswer.trim().length > 0;

        const isCorrect = hasAnswer ? (
          currentCard.answerType === 'options'
            ? selectedOption === currentCard.correctOption
            : textAnswer.trim().toLowerCase() === (currentCard.textAnswer || '').trim().toLowerCase()
        ) : false;

        finalAnswers.push({
          cardId: currentCard.id,
          userAnswer: currentCard.answerType === 'options' ? (selectedOption ?? -1) : textAnswer,
          isCorrect,
          timeSpent,
        });
      }

      // Marcar las preguntas restantes como incorrectas
      const answeredCardIds = new Set(finalAnswers.map(a => a.cardId));
      const unansweredCards = preparedCards.filter(card => !answeredCardIds.has(card.id));

      for (const card of unansweredCards) {
        finalAnswers.push({
          cardId: card.id,
          userAnswer: card.answerType === 'options' ? -1 : '',
          isCorrect: false,
          timeSpent: 0,
        });
      }

      const correctCount = finalAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = preparedCards.length;

      const result: QuizResult = {
        quizId: '',
        quizTitle,
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        score: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
        totalTime: config.timeLimit || totalTimeElapsed,
        answers: finalAnswers,
      };

      onFinish(result);
    }
  }, [isFinished]);

  // Reset cuando cambia la pregunta
  useEffect(() => {
    setSelectedOption(null);
    setTextAnswer('');
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // Reset cuando se abre el quiz
  useEffect(() => {
    if (visible) {
      const now = Date.now();
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedOption(null);
      setTextAnswer('');
      setQuestionStartTime(now);
      setTotalTimeElapsed(0);
      setTimeRemaining(config.timeLimit);
      setQuizStartTime(now);
      setIsFinished(false);
      setFinishedByTimeout(false);
    }
  }, [visible, config.timeLimit]);

  const checkAnswer = useCallback((): boolean => {
    if (!currentCard) return false;

    if (currentCard.answerType === 'options') {
      return selectedOption === currentCard.correctOption;
    } else {
      // Para texto, comparar ignorando mayúsculas/minúsculas y espacios extra
      const userText = textAnswer.trim().toLowerCase();
      const correctText = (currentCard.textAnswer || '').trim().toLowerCase();
      return userText === correctText;
    }
  }, [currentCard, selectedOption, textAnswer]);

  const handleNext = () => {
    if (isFinished) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = checkAnswer();

    const answer: QuizAnswer = {
      cardId: currentCard.id,
      userAnswer: currentCard.answerType === 'options' ? (selectedOption ?? -1) : textAnswer,
      isCorrect,
      timeSpent,
    };

    setAnswers([...answers, answer]);

    if (isLastQuestion) {
      // Terminar quiz con la última respuesta incluida
      setIsFinished(true);
      const correctCount = [...answers, answer].filter(a => a.isCorrect).length;
      const totalQuestions = preparedCards.length;

      const result: QuizResult = {
        quizId: '',
        quizTitle,
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        score: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
        totalTime: totalTimeElapsed,
        answers: [...answers, answer],
      };
      onFinish(result);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canProceed = currentCard?.answerType === 'options'
    ? selectedOption !== null
    : textAnswer.trim().length > 0;

  if (!visible || !currentCard) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { paddingTop: 50 }]}>
        {/* Header con progreso y tiempo */}
        <View style={[styles.header, { paddingTop: 0 }]}>
          <Pressable onPress={onCancel}>
            <Text style={styles.backButton}>✕ Salir</Text>
          </Pressable>
          <Text style={styles.titleSmall}>
            {currentIndex + 1} / {preparedCards.length}
          </Text>
          {config.timeLimit !== null && (
            <Text style={[
              styles.titleSmall,
              timeRemaining !== null && timeRemaining < 30 && { color: colors.danger }
            ]}>
              ⏱️ {formatTime(timeRemaining ?? 0)}
            </Text>
          )}
          {config.timeLimit === null && (
            <Text style={styles.titleSmall}>
              ⏱️ {formatTime(totalTimeElapsed)}
            </Text>
          )}
        </View>

        {/* Barra de progreso */}
        <View style={{
          height: 4,
          backgroundColor: colors.border,
          marginHorizontal: 20,
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            width: `${((currentIndex + 1) / preparedCards.length) * 100}%`,
            backgroundColor: colors.primary,
          }} />
        </View>

        {/* Contenido de la pregunta */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Pregunta */}
          <View style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 14,
              color: colors.textMuted,
              marginBottom: 8,
            }}>
              Pregunta {currentIndex + 1}
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.textPrimary,
              lineHeight: 28,
            }}>
              {currentCard.question}
            </Text>
          </View>

          {/* Respuestas */}
          {currentCard.answerType === 'options' ? (
            <View>
              {currentCard.options?.map((option, index) => (
                <Pressable
                  key={index}
                  style={[
                    {
                      backgroundColor: selectedOption === index
                        ? colors.primaryLight
                        : colors.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: selectedOption === index
                        ? colors.primary
                        : colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  ]}
                  onPress={() => setSelectedOption(index)}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: selectedOption === index ? colors.primary : colors.borderStrong,
                    backgroundColor: selectedOption === index ? colors.primary : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    {selectedOption === index && (
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: colors.textPrimary,
                    flex: 1,
                  }}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View>
              <Text style={{
                fontSize: 14,
                color: colors.textMuted,
                marginBottom: 8,
              }}>
                Tu respuesta:
              </Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, { minHeight: 120 }]}
                placeholder="Escribe tu respuesta..."
                placeholderTextColor={colors.textMuted}
                value={textAnswer}
                onChangeText={setTextAnswer}
                multiline
              />
            </View>
          )}
        </ScrollView>

        {/* Botón siguiente/finalizar */}
        <View style={{ padding: 20, paddingBottom: 40 }}>
          <Pressable
            style={[
              styles.modalButtonConfirm,
              {
                opacity: canProceed ? 1 : 0.5,
                paddingVertical: 18,
                paddingHorizontal: 24,
                minHeight: 60,
                justifyContent: 'center',
                alignItems: 'center',
              }
            ]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={[styles.modalButtonText, { fontSize: 16, textAlign: 'center', lineHeight: 22 }]}>
              {isLastQuestion ? 'Finalizar' : 'Siguiente'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// Modal de configuración del quiz
export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({
  visible,
  quizTitle,
  cardCount,
  onStart,
  onCancel,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState('5');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const handleTimeChange = (value: string) => {
    setTimeMinutes(value);
    if (hasTimeLimit) {
      const validation = validateTimeInput(value);
      setTimeError(validation.error);
    }
  };

  const handleStart = () => {
    if (hasTimeLimit) {
      const validation = validateTimeInput(timeMinutes);
      if (!validation.valid) {
        setTimeError(validation.error);
        return;
      }
      const config: QuizConfig = {
        timeLimit: validation.seconds,
        shuffleQuestions,
        shuffleOptions,
      };
      onStart(config);
    } else {
      const config: QuizConfig = {
        timeLimit: null,
        shuffleQuestions,
        shuffleOptions,
      };
      onStart(config);
    }
  };

  // Limpiar error cuando se desactiva el tiempo límite
  const handleToggleTimeLimit = () => {
    const newValue = !hasTimeLimit;
    setHasTimeLimit(newValue);
    if (!newValue) {
      setTimeError(null);
    } else {
      const validation = validateTimeInput(timeMinutes);
      setTimeError(validation.error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>🎮 Configurar Quiz</Text>

            {/* Info del quiz */}
            <View style={{
              backgroundColor: colors.primaryLight,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: 4,
              }}>
                {quizTitle}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {cardCount} pregunta{cardCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Opción: Tiempo límite */}
            <View style={{ marginBottom: 20 }}>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                onPress={handleToggleTimeLimit}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: hasTimeLimit ? colors.primary : colors.borderStrong,
                  backgroundColor: hasTimeLimit ? colors.primary : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  {hasTimeLimit && (
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                  )}
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                  ⏱️ Tiempo límite
                </Text>
              </Pressable>

              {hasTimeLimit && (
                <View style={{ marginLeft: 36 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <TextInput
                      style={[styles.input, {
                        width: 80,
                        textAlign: 'center',
                        marginBottom: 0,
                        marginRight: 8,
                        borderColor: timeError ? colors.danger : colors.border,
                      }]}
                      value={timeMinutes}
                      onChangeText={handleTimeChange}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                    <Text style={{ color: colors.textSecondary }}>minutos</Text>
                  </View>
                  {timeError && (
                    <Text style={{
                      color: colors.danger,
                      fontSize: 12,
                      marginTop: 4,
                    }}>
                      {timeError}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Opción: Mezclar preguntas */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
              onPress={() => setShuffleQuestions(!shuffleQuestions)}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: shuffleQuestions ? colors.primary : colors.borderStrong,
                backgroundColor: shuffleQuestions ? colors.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                {shuffleQuestions && (
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                🔀 Mezclar preguntas
              </Text>
            </Pressable>

            {/* Opción: Mezclar opciones */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
              }}
              onPress={() => setShuffleOptions(!shuffleOptions)}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: shuffleOptions ? colors.primary : colors.borderStrong,
                backgroundColor: shuffleOptions ? colors.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                {shuffleOptions && (
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                🔀 Mezclar opciones
              </Text>
            </Pressable>

            {/* Botones */}
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={onCancel}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButtonConfirm, (cardCount === 0 || (hasTimeLimit && timeError)) && { opacity: 0.5 }]}
                onPress={handleStart}
                disabled={cardCount === 0 || (hasTimeLimit && !!timeError)}
              >
                <Text style={styles.modalButtonText}>▶️ Iniciar</Text>
              </Pressable>
            </View>

            {cardCount === 0 && (
              <Text style={{
                color: colors.danger,
                textAlign: 'center',
                marginTop: 12,
                fontSize: 14,
              }}>
                Este quiz no tiene preguntas
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Modal de resultados
export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  visible,
  result,
  onClose,
  onRetry,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  if (!result) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 70) return colors.success;
    if (score >= 50) return '#F59E0B'; // amber
    return colors.danger;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>📊 Resultados</Text>

            {/* Puntuación principal */}
            <View style={{
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Text style={{ fontSize: 60, marginBottom: 8 }}>
                {getScoreEmoji(result.score)}
              </Text>
              <Text style={{
                fontSize: 48,
                fontWeight: '700',
                color: getScoreColor(result.score),
              }}>
                {result.score}%
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {getScoreMessage(result.score)}
              </Text>
            </View>

            {/* Estadísticas */}
            <View style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <Text style={{ color: colors.textSecondary }}>Correctas</Text>
                <Text style={{ color: colors.success, fontWeight: '600' }}>
                  ✓ {result.correctAnswers}
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <Text style={{ color: colors.textSecondary }}>Incorrectas</Text>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>
                  ✕ {result.incorrectAnswers}
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <Text style={{ color: colors.textSecondary }}>Total preguntas</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {result.totalQuestions}
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <Text style={{ color: colors.textSecondary }}>Tiempo total</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  ⏱️ {formatTimeVerbose(result.totalTime)}
                </Text>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={onRetry}>
                <Text style={styles.modalButtonText}>🔄 Reintentar</Text>
              </Pressable>
              <Pressable style={styles.modalButtonConfirm} onPress={onClose}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
