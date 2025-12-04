import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import { normalize, hp } from '../constants/theme';
import { formatDate, formatTimeVerbose, getScoreIcon } from '../utils';
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
        <View style={[styles.modalContentLarge, { maxHeight: hp(80) }]}>
          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            marginBottom: normalize(16),
            backgroundColor: colors.cardBackground,
            borderRadius: normalize(10),
            padding: normalize(4),
          }}>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: normalize(10),
                borderRadius: normalize(8),
                backgroundColor: activeTab === 'profile' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={{
                color: activeTab === 'profile' ? '#FFF' : colors.textSecondary,
                fontWeight: '600',
                fontSize: normalize(14),
              }}>
                <Ionicons name="person" size={normalize(14)} /> Perfil
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: normalize(10),
                borderRadius: normalize(8),
                backgroundColor: activeTab === 'history' ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('history')}
            >
              <Text style={{
                color: activeTab === 'history' ? '#FFF' : colors.textSecondary,
                fontWeight: '600',
                fontSize: normalize(14),
              }}>
                <Ionicons name="bar-chart" size={normalize(14)} /> Historial
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={{ padding: normalize(40), alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textPrimary, marginTop: normalize(16), fontSize: normalize(14) }}>Cargando...</Text>
            </View>
          ) : activeTab === 'profile' ? (
            // Tab de Perfil
            user ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: normalize(10) }}
              >
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
                    borderRadius: normalize(12),
                    padding: normalize(16),
                    marginTop: normalize(8),
                    alignItems: 'center',
                  }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textMuted, marginTop: normalize(8), fontSize: normalize(12) }}>
                      Cargando estadísticas...
                    </Text>
                  </View>
                ) : stats && stats.total_quizzes > 0 ? (
                  <View style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: normalize(12),
                    padding: normalize(14),
                    marginTop: normalize(8),
                  }}>
                    <Text style={{
                      fontSize: normalize(13),
                      fontWeight: '600',
                      color: colors.textMuted,
                      marginBottom: normalize(10),
                      textAlign: 'center',
                    }}>
                      Estadísticas
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: normalize(20), fontWeight: '700', color: colors.primary }}>
                          {stats.total_quizzes}
                        </Text>
                        <Text style={{ fontSize: normalize(11), color: colors.textMuted }}>Quizzes</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: normalize(20), fontWeight: '700', color: getScoreColor(stats.average_score) }}>
                          {stats.average_score}%
                        </Text>
                        <Text style={{ fontSize: normalize(11), color: colors.textMuted }}>Promedio</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: normalize(20), fontWeight: '700', color: colors.success }}>
                          {stats.total_correct}
                        </Text>
                        <Text style={{ fontSize: normalize(11), color: colors.textMuted }}>Correctas</Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <View style={[styles.modalButtons, { marginTop: normalize(20) }]}>
                  <Pressable style={styles.modalButtonCancel} onPress={onLogout}>
                    <Text style={styles.modalButtonText}>Salir</Text>
                  </Pressable>
                  <Pressable style={styles.modalButtonConfirm} onPress={onClose}>
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : (
              <View style={{ padding: normalize(20), alignItems: 'center' }}>
                <Text style={{ color: colors.danger, fontSize: normalize(14) }}>Error al cargar perfil</Text>
                <Pressable style={[styles.modalButtonConfirm, { marginTop: normalize(16) }]} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            )
          ) : (
            // Tab de Historial
            <>
              {historyLoading ? (
                <View style={{ padding: normalize(40), alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textPrimary, marginTop: normalize(16), fontSize: normalize(14) }}>Cargando historial...</Text>
                </View>
              ) : history.length === 0 ? (
                <View style={{ padding: normalize(40), alignItems: 'center' }}>
                  <Ionicons name="file-tray-outline" size={normalize(40)} color={colors.textMuted} />
                  <Text style={{ color: colors.textPrimary, fontSize: normalize(16), fontWeight: '600', marginTop: normalize(16) }}>
                    Sin historial
                  </Text>
                  <Text style={{ color: colors.textMuted, marginTop: normalize(8), textAlign: 'center', fontSize: normalize(14) }}>
                    Completa quizzes para ver tu historial aquí
                  </Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: hp(40) }} showsVerticalScrollIndicator={false}>
                  {history.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: normalize(12),
                        padding: normalize(14),
                        marginBottom: normalize(10),
                        borderLeftWidth: normalize(4),
                        borderLeftColor: getScoreColor(entry.score),
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, marginRight: normalize(10) }}>
                          <Text style={{
                            fontSize: normalize(15),
                            fontWeight: '600',
                            color: colors.textPrimary,
                            marginBottom: normalize(4),
                          }} numberOfLines={1}>
                            {entry.quiz_title}
                          </Text>


                          {entry.is_external && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: normalize(4),
                            }}>
                              <Text style={{
                                fontSize: normalize(11),
                                color: colors.primary,
                                backgroundColor: colors.primaryLight,
                                paddingHorizontal: normalize(6),
                                paddingVertical: normalize(2),
                                borderRadius: normalize(4),
                              }}>
                                <Ionicons name="link" size={normalize(10)} /> {entry.owner_name ? `De ${entry.owner_name}` : 'Quiz compartido'}
                              </Text>
                            </View>
                          )}

                          <Text style={{ fontSize: normalize(12), color: colors.textMuted }}>
                            {entry.correct_answers}/{entry.total_questions} correctas • {formatTimeVerbose(entry.time_spent)}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{
                            fontSize: normalize(18),
                            fontWeight: '700',
                            color: getScoreColor(entry.score),
                          }}>
                            {entry.score}%
                          </Text>
                          <Ionicons name={getScoreIcon(entry.score) as any} size={normalize(18)} color={getScoreColor(entry.score)} />
                          <Text style={{ fontSize: normalize(11), color: colors.textMuted, marginTop: normalize(2) }}>
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
                  paddingVertical: normalize(14),
                  borderRadius: normalize(12),
                  backgroundColor: colors.border,
                  alignItems: 'center',
                  marginTop: normalize(16),
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
