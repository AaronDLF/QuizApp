import React, { useMemo } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { createHomeStyles } from '../styles/homeStyles';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils';
import type {
  NewQuizModalProps,
  NewCardModalProps,
  CardDetailModalProps,
  UserProfileModalProps,
  EditCardModalProps,
} from '../types/components';

// Modal de Perfil de Usuario
export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  user,
  loading,
  onClose,
  onLogout,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentLarge}>
          <Text style={styles.modalTitle}>👤 Mi Perfil</Text>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Cargando...</Text>
            </View>
          ) : user ? (
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
          )}
        </View>
      </View>
    </Modal>
  );
};

// Modal para crear nuevo Quiz
export const NewQuizModal: React.FC<NewQuizModalProps> = ({
  visible,
  title,
  onTitleChange,
  onCancel,
  onCreate,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo Quiz</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del quiz"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={onTitleChange}
          />
          <View style={styles.modalButtons}>
            <Pressable style={styles.modalButtonCancel} onPress={onCancel}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.modalButtonConfirm} onPress={onCreate}>
              <Text style={styles.modalButtonText}>Crear</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal para crear nueva Card
export const NewCardModal: React.FC<NewCardModalProps> = ({
  visible,
  question,
  onQuestionChange,
  answerType,
  onAnswerTypeChange,
  textAnswer,
  onTextAnswerChange,
  options,
  onOptionChange,
  correctOption,
  onCorrectOptionChange,
  onCancel,
  onAdd,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Nueva Card</Text>

            <Text style={styles.inputLabel}>Pregunta</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={onQuestionChange}
              multiline
            />

            <Text style={styles.inputLabel}>Tipo de respuesta</Text>
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeOption,
                  answerType === 'text' && styles.typeOptionSelected
                ]}
                onPress={() => onAnswerTypeChange('text')}
              >
                <Text style={styles.typeOptionText}>📝 Texto</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeOption,
                  answerType === 'options' && styles.typeOptionSelected
                ]}
                onPress={() => onAnswerTypeChange('options')}
              >
                <Text style={styles.typeOptionText}>🔘 Opciones</Text>
              </Pressable>
            </View>

            {answerType === 'text' ? (
              <>
                <Text style={styles.inputLabel}>Respuesta</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Escribe la respuesta..."
                  placeholderTextColor={colors.textMuted}
                  value={textAnswer}
                  onChangeText={onTextAnswerChange}
                  multiline
                />
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Opciones (toca para marcar correcta)</Text>
                {options.map((option, index) => (
                  <Pressable
                    key={index}
                    style={styles.optionInputContainer}
                    onPress={() => onCorrectOptionChange(index)}
                  >
                    <View style={[
                      styles.optionRadio,
                      correctOption === index && styles.optionRadioSelected
                    ]}>
                      {correctOption === index && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <TextInput
                      style={styles.optionInput}
                      placeholder={`Opción ${index + 1}`}
                      placeholderTextColor={colors.textMuted}
                      value={option}
                      onChangeText={(text) => onOptionChange(index, text)}
                    />
                  </Pressable>
                ))}
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={onCancel}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalButtonConfirm} onPress={onAdd}>
                <Text style={styles.modalButtonText}>Agregar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Modal para ver detalle de Card
export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  visible,
  card,
  onClose,
  onEdit,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentLarge}>
          <Text style={styles.modalTitle}>📋 Detalle de Card</Text>

          {card && (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Pregunta:</Text>
                <Text style={styles.detailText}>{card.question}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  {card.answerType === 'text' ? 'Respuesta:' : 'Opciones:'}
                </Text>
                {card.answerType === 'text' ? (
                  <Text style={styles.detailText}>{card.textAnswer}</Text>
                ) : (
                  card.options?.map((option, index) => (
                    <View key={index} style={styles.detailOption}>
                      <View style={[
                        styles.detailOptionIndicator,
                        card.correctOption === index && styles.detailOptionCorrect
                      ]}>
                        {card.correctOption === index && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.detailOptionText,
                        card.correctOption === index && styles.detailOptionTextCorrect
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          <View style={[styles.modalButtons, { marginTop: 20 }]}>
            <Pressable style={styles.modalButtonCancel} onPress={onEdit}>
              <Text style={styles.modalButtonText}>✏️ Editar</Text>
            </Pressable>
            <Pressable style={styles.modalButtonConfirm} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal para editar Card
export const EditCardModal: React.FC<EditCardModalProps> = ({
  visible,
  question,
  onQuestionChange,
  answerType,
  onAnswerTypeChange,
  textAnswer,
  onTextAnswerChange,
  options,
  onOptionChange,
  correctOption,
  onCorrectOptionChange,
  onCancel,
  onSave,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>✏️ Editar Card</Text>

            <Text style={styles.inputLabel}>Pregunta</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={onQuestionChange}
              multiline
            />

            <Text style={styles.inputLabel}>Tipo de respuesta</Text>
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeOption,
                  answerType === 'text' && styles.typeOptionSelected
                ]}
                onPress={() => onAnswerTypeChange('text')}
              >
                <Text style={styles.typeOptionText}>📝 Texto</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeOption,
                  answerType === 'options' && styles.typeOptionSelected
                ]}
                onPress={() => onAnswerTypeChange('options')}
              >
                <Text style={styles.typeOptionText}>🔘 Opciones</Text>
              </Pressable>
            </View>

            {answerType === 'text' ? (
              <>
                <Text style={styles.inputLabel}>Respuesta</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Escribe la respuesta..."
                  placeholderTextColor={colors.textMuted}
                  value={textAnswer}
                  onChangeText={onTextAnswerChange}
                  multiline
                />
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Opciones (toca para marcar correcta)</Text>
                {options.map((option, index) => (
                  <Pressable
                    key={index}
                    style={styles.optionInputContainer}
                    onPress={() => onCorrectOptionChange(index)}
                  >
                    <View style={[
                      styles.optionRadio,
                      correctOption === index && styles.optionRadioSelected
                    ]}>
                      {correctOption === index && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <TextInput
                      style={styles.optionInput}
                      placeholder={`Opción ${index + 1}`}
                      placeholderTextColor={colors.textMuted}
                      value={option}
                      onChangeText={(text) => onOptionChange(index, text)}
                    />
                  </Pressable>
                ))}
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={onCancel}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalButtonConfirm} onPress={onSave}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
