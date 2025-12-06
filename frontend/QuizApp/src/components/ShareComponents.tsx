import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import {
  generateShareCode,
  revokeShareCode,
  getQuizInfoByCode,
  getSharedQuizFull,
} from '../services/api';
import type { SharedQuizInfo } from '../types/api';
import type { ShareModalProps, JoinQuizModalProps } from '../types/components';

// ==================== SHARE MODAL ====================

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  quizId,
  quizTitle,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Limpiar estados cuando la modal se cierra
  useEffect(() => {
    if (!visible) {
      setShareCode(null);
      setError(null);
      setCopied(false);
    }
  }, [visible]);

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateShareCode(quizId);
      setShareCode(result.share_code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCode = async () => {
    try {
      setLoading(true);
      setError(null);
      await revokeShareCode(quizId);
      setShareCode(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareCode) return;

    try {
      await Share.share({
        message: `¡Únete a mi quiz "${quizTitle}"!\n\nCódigo: ${shareCode}\n\nAbre la app Quiz y usa este código para jugar.`,
        title: `Quiz: ${quizTitle}`,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleCopyCode = () => {
    if (!shareCode) return;

    // En web usamos el clipboard API
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // En móvil usamos Share
      handleShare();
    }
  };

  const handleClose = () => {
    setShareCode(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}><Ionicons name="share-social" size={20} /> Compartir</Text>

          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: 20,
          }}>
            {quizTitle}
          </Text>

          {error && (
            <Text style={{
              color: colors.danger,
              textAlign: 'center',
              marginBottom: 12,
            }}>
              {error}
            </Text>
          )}

          {shareCode ? (
            <View>
              {/* Código generado */}
              <View style={{
                backgroundColor: colors.primaryLight,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: 8,
                }}>
                  CÓDIGO PARA COMPARTIR
                </Text>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: colors.primary,
                  letterSpacing: 4,
                }}>
                  {shareCode}
                </Text>
              </View>

              {/* Botones de acción */}
              <View style={{ gap: 8, marginBottom: 16 }}>
                <Pressable
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                  onPress={handleCopyCode}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 6 }}>
                      {copied ? 'Copiado' : 'Copiar código'}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center',
                  }}
                  onPress={handleShare}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>
                    📤 Compartir
                  </Text>
                </Pressable>

                <Pressable
                  style={{
                    backgroundColor: colors.dangerLight,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center',
                  }}
                  onPress={handleRevokeCode}
                  disabled={loading}
                >
                  <Text style={{ color: colors.danger, fontWeight: '600' }}>
                    🚫 Dejar de compartir
                  </Text>
                </Pressable>
              </View>

              <Text style={{
                fontSize: 12,
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                Cualquier persona con este código podrá jugar tu quiz
              </Text>
            </View>
          ) : (
            <View>
              <Text style={{
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 20,
              }}>
                Genera un código para que otros puedan jugar tu quiz
              </Text>

              <Pressable
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 14,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
                onPress={handleGenerateCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>
                    🔑 Generar código
                  </Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Botón cerrar */}
          <Pressable
            style={{
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
            onPress={handleClose}
          >
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ==================== JOIN QUIZ MODAL ====================

export const JoinQuizModal: React.FC<JoinQuizModalProps> = ({
  visible,
  onJoinSuccess,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizInfo, setQuizInfo] = useState<SharedQuizInfo | null>(null);

  // Limpiar estados cuando la modal se cierra
  useEffect(() => {
    if (!visible) {
      setCode('');
      setError(null);
      setQuizInfo(null);
    }
  }, [visible]);

  const handleCodeChange = (text: string) => {
    // Solo permitir letras y números, convertir a mayúsculas
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setCode(cleaned.slice(0, 6));
    setError(null);
    setQuizInfo(null);
  };

  const handleSearchQuiz = async () => {
    if (code.length < 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await getQuizInfoByCode(code);
      setQuizInfo(info);
    } catch (err: any) {
      setError(err.message);
      setQuizInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!quizInfo) return;

    try {
      setLoading(true);
      setError(null);
      const fullQuiz = await getSharedQuizFull(code);
      onJoinSuccess(fullQuiz, quizInfo.owner_name);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setQuizInfo(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}><Ionicons name="enter" size={20} /> Unirse a Quiz</Text>

          <Text style={{
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
          }}>
            Ingresa el código que te compartieron
          </Text>

          {/* Input de código */}
          <TextInput
            style={[styles.input, {
              fontSize: 28,
              textAlign: 'center',
              letterSpacing: 6,
              fontWeight: '700',
            }]}
            placeholder="ABC123"
            placeholderTextColor={colors.textMuted}
            value={code}
            onChangeText={handleCodeChange}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {error && (
            <Text style={{
              color: colors.danger,
              textAlign: 'center',
              marginTop: 8,
            }}>
              {error}
            </Text>
          )}

          {/* Info del quiz encontrado */}
          {quizInfo && (
            <View style={{
              backgroundColor: colors.successLight,
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginLeft: 6,
                }}>
                  {quizInfo.title}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary }}>
                Por: {quizInfo.owner_name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                {quizInfo.question_count} pregunta{quizInfo.question_count !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Botones */}
          <View style={[styles.modalButtons, { marginTop: 20 }]}>
            <Pressable style={styles.modalButtonCancel} onPress={handleClose}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </Pressable>

            {quizInfo ? (
              <Pressable
                style={[styles.modalButtonConfirm, loading && { opacity: 0.5 }]}
                onPress={handleJoin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}><Ionicons name="play" size={14} /> Jugar</Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.modalButtonConfirm,
                  (loading || code.length < 6) && { opacity: 0.5 }
                ]}
                onPress={handleSearchQuiz}
                disabled={loading || code.length < 6}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Buscar</Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
