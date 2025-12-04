import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import { normalize } from '../constants/theme';
import type {
  QuizListProps,
  CardListProps,
  EmptyStateProps,
  FABProps,
} from '../types/components';

// Estado vacío
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, colors: colorsProp }) => {
  const { colors: contextColors } = useTheme();
  const colors = colorsProp || contextColors;
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={normalize(50)} color={colors.textMuted} style={{ marginBottom: 16 }} />
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{subtitle}</Text>
    </View>
  );
};

// Lista de Quizzes
export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onSelectQuiz,
  onDeleteQuiz,
  onPlayQuiz,
  onShareQuiz,
  colors: colorsProp,
}) => {
  const { colors: contextColors } = useTheme();
  const colors = colorsProp || contextColors;
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {quizzes.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No tienes quizzes aun"
          subtitle="Crea tu primer quiz para empezar"
          colors={colors}
        />
      ) : (
        quizzes.map(quiz => (
          <Pressable
            key={quiz.id}
            style={styles.quizCard}
            onPress={() => onSelectQuiz(quiz)}
          >
            <View style={styles.quizCardContent}>
              <Text style={styles.quizCardTitle}>{quiz.title}</Text>
              <Text style={styles.quizCardCount}>{quiz.cardCount ?? quiz.cards.length} cards</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
              {onShareQuiz && (
                <Pressable
                  style={{
                    width: normalize(36),
                    height: normalize(36),
                    borderRadius: normalize(18),
                    backgroundColor: colors.successLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => onShareQuiz(quiz)}
                >
                  <Ionicons name="link" size={normalize(16)} color={colors.success} />
                </Pressable>
              )}
              <Pressable
                style={{
                  width: normalize(36),
                  height: normalize(36),
                  borderRadius: normalize(18),
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => onPlayQuiz(quiz)}
              >
                <Ionicons name="play" size={normalize(16)} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => onDeleteQuiz(quiz.id)}
              >
                <Ionicons name="close" size={normalize(16)} color={colors.danger} />
              </Pressable>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

// Lista de Cards
export const CardList: React.FC<CardListProps> = ({
  cards,
  onSelectCard,
  onDeleteCard,
  colors: colorsProp,
}) => {
  const { colors: contextColors } = useTheme();
  const colors = colorsProp || contextColors;
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {cards.length === 0 ? (
        <EmptyState
          icon="help-circle-outline"
          title="No hay cards en este quiz"
          subtitle="Agrega tu primera pregunta"
          colors={colors}
        />
      ) : (
        cards.map((card, index) => (
          <Pressable
            key={card.id}
            style={styles.cardItem}
            onPress={() => onSelectCard(card)}
          >
            <View style={styles.cardItemHeader}>
              <Text style={styles.cardNumber}>#{index + 1}</Text>
              <View style={[
                styles.cardTypeBadge,
                { backgroundColor: card.answerType === 'text' ? colors.primary : colors.success }
              ]}>
                <Text style={styles.cardTypeBadgeText}>
                  {card.answerType === 'text' ? 'Texto' : 'Opciones'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardQuestion} numberOfLines={2}>{card.question}</Text>
            <Pressable
              style={styles.cardDeleteButton}
              onPress={() => onDeleteCard(card.id)}
            >
              <Ionicons name="close" size={normalize(16)} color={colors.danger} />
            </Pressable>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

// Floating Action Button
export const FAB: React.FC<FABProps> = ({ onPress, colors: colorsProp }) => {
  const { colors: contextColors } = useTheme();
  const colors = colorsProp || contextColors;
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </Pressable>
  );
};
