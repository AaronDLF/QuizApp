import { View, Text, StyleSheet, Pressable, TextInput, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { register } from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { darkTheme } from '../src/constants/theme';

type ThemeColors = typeof darkTheme;

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  button: {
    width: 260,
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.primary,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  buttonOutline: {
    width: 260,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent',
  },
  buttonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },
  inputContainer: {
    width: 260,
    marginVertical: 8,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 16,
    padding: 4,
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: 260,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  requirementsContainer: {
    width: 260,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  checkmark: {
    fontSize: 14,
    marginRight: 8,
    width: 16,
  },
  requirementText: {
    fontSize: 13,
  },
  valid: {
    color: colors.success,
  },
  invalid: {
    color: colors.textDimmed,
  },
  matchIndicator: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  inputValid: {
    borderColor: colors.success,
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
});

// Validación de requisitos de contraseña
interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Al menos 8 caracteres', validator: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', validator: (p) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula', validator: (p) => /[a-z]/.test(p) },
  { label: 'Un número', validator: (p) => /[0-9]/.test(p) },
  { label: 'Un carácter especial (!@#$%^&*)', validator: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function Register() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validar requisitos de contraseña en tiempo real
  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      isValid: req.validator(password),
    }));
  }, [password]);

  const allRequirementsMet = passwordValidation.every((req) => req.isValid);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async () => {
    // Validaciones
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!allRequirementsMet) {
      setError('La contraseña no cumple todos los requisitos');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      // Registro exitoso, ir al login
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.title}>Crear Cuenta</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <Pressable
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={8}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Indicadores de requisitos de contraseña */}
      {password.length > 0 && (
        <View style={styles.requirementsContainer}>
          {passwordValidation.map((req, index) => (
            <View key={index} style={styles.requirementRow}>
              <Ionicons
                name={req.isValid ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={req.isValid ? colors.success : colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.requirementText, req.isValid ? styles.valid : styles.invalid]}>
                {req.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            confirmPassword.length > 0 && (passwordsMatch ? styles.inputValid : styles.inputInvalid),
          ]}
          placeholder="Confirmar Contraseña"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
        <Pressable
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          hitSlop={8}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
        {confirmPassword.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Ionicons
              name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={passwordsMatch ? colors.success : colors.danger}
            />
            <Text style={[styles.matchIndicator, passwordsMatch ? styles.valid : styles.invalid]}>
              {passwordsMatch ? ' Contraseñas coinciden' : ' Las contraseñas no coinciden'}
            </Text>
          </View>
        )}
      </View>

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        {Platform.OS === 'web' ? (
          <View style={styles.blur}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </View>
        ) : (
          <BlurView intensity={25} tint={isDark ? "light" : "dark"} style={styles.blur}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </BlurView>
        )}
      </Pressable>

      <Link href="/login" asChild>
        <Pressable style={styles.buttonOutline} disabled={loading}>
          <Text style={styles.buttonOutlineText}>Ya tengo cuenta</Text>
        </Pressable>
      </Link>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
