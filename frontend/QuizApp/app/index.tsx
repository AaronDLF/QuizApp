import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from '../src/context/ThemeContext';
import { useMemo } from 'react';
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
});

export default function Index() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bienvenido a QuizApp</Text>

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          {Platform.OS === 'web' ? (
            <View style={styles.blur}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </View>
          ) : (
            <BlurView intensity={25} tint={isDark ? "light" : "dark"} style={styles.blur}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </BlurView>
          )}
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.buttonOutline}>
          <Text style={styles.buttonOutlineText}>Crear Cuenta</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}
