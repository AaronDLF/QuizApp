import { View, Text, StyleSheet, Pressable, TextInput, Platform, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { login } from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { darkTheme } from '../src/constants/theme';

type ThemeColors = typeof darkTheme;

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
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
});

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Permitir que el botón de retroceso cierre la app desde login
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Retornar false permite el comportamiento por defecto (cerrar app)
      return false;
    });

    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

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

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {Platform.OS === 'web' ? (
          <View style={styles.blur}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </View>
        ) : (
          <BlurView intensity={25} tint={isDark ? "light" : "dark"} style={styles.blur}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </BlurView>
        )}
      </Pressable>

      <Link href="/register" asChild>
        <Pressable style={styles.buttonOutline} disabled={loading}>
          <Text style={styles.buttonOutlineText}>Crear Cuenta</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}
