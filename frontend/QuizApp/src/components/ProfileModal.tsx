import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import { formatDate, formatTimeVerbose, getScoreEmoji } from '../utils';
import { getMyHistory, getMyStats } from '../services/api';
import type { QuizHistoryEntry, UserStats } from '../services/history';
import type { User } from '../types/components';

interface ProfileWithHistoryModalProps {
  visible: boolean;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type TabType = 'profile' | 'history';

export const ProfileWithHistoryModal: React.FC<ProfileWithHistoryModalProps> = ({
  visible,
  user,
  loading,
  onClose,
  onLogout,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Cargar estadísticas siempre que se abre el modal
  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  // Cargar historial cuando cambia a la pestaña de historial
  useEffect(() => {
    if (visible && activeTab === 'history') {
      loadHistory();
    }
  }, [visible, activeTab]);

  // Reset cuando se cierra
  useEffect(() => {
    if (!visible) {
      setActiveTab('profile');
      // Limpiar datos para forzar recarga la próxima vez
      setHistory([]);
      setStats(null);
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await getMyStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyData = await getMyHistory(30);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return colors.success;
    if (score >= 50) return '#F59E0B';
    return colors.danger;
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContentLarge, { maxHeight: '80%' }]}>
          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 16,
            backgroundColor: colors.cardBackground,
            borderRadius: 10,
            padding: 4,
          }}>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'profile' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={{
                color: activeTab === 'profile' ? '#FFF' : colors.textSecondary,
                fontWeight: '600',
              }}>
                👤 Perfil
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'history' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('history')}
            >
              <Text style={{
                color: activeTab === 'history' ? '#FFF' : colors.textSecondary,
                fontWeight: '600',
              }}>
                📊 Historial
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Cargando...</Text>
            </View>
          ) : activeTab === 'profile' ? (
            // Tab de Perfil
            user ? (
              <>
                <View style={styles.profileAvatarContainer}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nombre</Text>
                  <Text style={styles.detailText}>{user.name}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailText}>{user.email}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Miembro desde</Text>
                  <Text style={styles.detailText}>{formatDate(user.created_at)}</Text>
                </View>

                {/* Resumen de estadísticas */}
                {statsLoading ? (
                  <View style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 8,
                    alignItems: 'center',
                  }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12 }}>
                      Cargando estadísticas...
                    </Text>
                  </View>
                ) : stats && stats.total_quizzes > 0 ? (
                  <View style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 8,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.textMuted,
                      marginBottom: 12,
                    }}>
                      📈 Estadísticas
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                          {stats.total_quizzes}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>Quizzes</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: getScoreColor(stats.average_score) }}>
                          {stats.average_score}%
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>Promedio</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.success }}>
                          {stats.total_correct}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>Correctas</Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <View style={[styles.modalButtons, { marginTop: 24 }]}>
                  <Pressable style={styles.modalButtonCancel} onPress={onLogout}>
                    <Text style={styles.modalButtonText}>🚪 Salir</Text>
                  </Pressable>
                  <Pressable style={styles.modalButtonConfirm} onPress={onClose}>
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.danger }}>Error al cargar perfil</Text>
                <Pressable style={[styles.modalButtonConfirm, { marginTop: 16 }]} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            )
          ) : (
            // Tab de Historial
            <>
              {historyLoading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Cargando historial...</Text>
                </View>
              ) : history.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                    Sin historial
                  </Text>
                  <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
                    Completa quizzes para ver tu historial aquí
                  </Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                  {history.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 10,
                        borderLeftWidth: 4,
                        borderLeftColor: getScoreColor(entry.score),
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: colors.textPrimary,
                            marginBottom: 4,
                          }} numberOfLines={1}>
                            {entry.quiz_title}
                          </Text>

                          {entry.is_external && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 4,
                            }}>
                              <Text style={{
                                fontSize: 11,
                                color: colors.primary,
                                backgroundColor: colors.primaryLight,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                              }}>
                                🔗 {entry.owner_name ? `De ${entry.owner_name}` : 'Quiz compartido'}
                              </Text>
                            </View>
                          )}

                          <Text style={{ fontSize: 12, color: colors.textMuted }}>
                            {entry.correct_answers}/{entry.total_questions} correctas • {formatTimeVerbose(entry.time_spent)}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: getScoreColor(entry.score),
                          }}>
                            {entry.score}%
                          </Text>
                          <Text style={{ fontSize: 18 }}>{getScoreEmoji(entry.score)}</Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                            {formatShortDate(entry.completed_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Pressable
                style={{
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.border,
                  alignItems: 'center',
                  marginTop: 16,
                }}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
