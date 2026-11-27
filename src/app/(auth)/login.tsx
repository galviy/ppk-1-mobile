import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Card } from '../../components/ui/card';
import { InputField } from '../../components/ui/input-field';
import { PrimaryButton } from '../../components/ui/primary-button';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/use-theme';
import { getHomeRouteForRole } from '../../lib/role-routing';
import { getAuthErrorMessage } from '../../services/authService';

function useKeyboardHeight() {
  const [tinggi, setTinggi] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setTinggi(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setTinggi(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return tinggi;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const keyboardHeight = useKeyboardHeight();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    // Validasi form
    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      // Proses autentikasi via Firebase (FR-01.2, FR-01.7, FR-S4-01.3)
      const userProfile = await login(email, password);

      // Arahkan ke dashboard sesuai 3 peran pengguna (FR-S4-01.4)
      router.replace(getHomeRouteForRole(userProfile.role) as Href);
    } catch (error: unknown) {
      // Tampilkan pesan error yang deskriptif (FR-01.10)
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isKeyboardVisible = keyboardHeight > 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              justifyContent: isKeyboardVisible ? 'flex-start' : 'center',
              paddingBottom: isKeyboardVisible ? keyboardHeight + 36 : Spacing.six,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>
          {/* Header Brand */}
          <View style={styles.brandHeader}>
            <View
              style={[
                styles.logoBadge,
                {
                  backgroundColor: theme.primaryBg,
                  borderColor: theme.primaryBorder,
                },
              ]}>
              <Ionicons
                name="flask-outline"
                size={30}
                color={theme.primaryText}
              />
            </View>
            <ThemedText type="subtitle" style={styles.title}>
              Praktikum PPK
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Masuk ke akun Anda untuk mengakses jadwal, presensi, pengelolaan lab, dan sesi
            </ThemedText>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <ThemedText type="smallBold" style={styles.formTitle}>
              Masuk ke Akun
            </ThemedText>

            {errorMessage && (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: theme.dangerBg,
                    borderColor: theme.dangerBorder,
                  },
                ]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={theme.dangerText}
                />
                <Text style={[styles.errorText, { color: theme.dangerText }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            <InputField
              label="Alamat Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
              disabled={isLoading}
            />

            <InputField
              label="Kata Sandi"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              required
              disabled={isLoading}
            />

            <View style={styles.buttonWrapper}>
              {isLoading ? (
                <View
                  style={[
                    styles.loadingContainer,
                    { backgroundColor: theme.primaryBg },
                  ]}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text
                    style={[styles.loadingText, { color: theme.primaryText }]}>
                    Memverifikasi akun...
                  </Text>
                </View>
              ) : (
                <PrimaryButton
                  label="Masuk Sekarang"
                  onPress={handleLogin}
                />
              )}
            </View>

            {/* Link ke Registrasi */}
            <View style={styles.registerPrompt}>
              <ThemedText themeColor="textSecondary" style={styles.promptText}>
                Belum memiliki akun?{' '}
              </ThemedText>
              <Pressable
                onPress={() => router.push('/(auth)/register')}
                hitSlop={8}>
                <Text style={[styles.registerLink, { color: theme.primaryText }]}>
                  Daftar Akun Baru
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Info Peran */}
          <View
            style={[
              styles.hintSection,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.borderSubtle,
              },
            ]}>
            <View style={styles.hintHeader}>
              <Ionicons name="bulb-outline" size={15} color={theme.info} />
              <Text style={[styles.hintBadge, { color: theme.text }]}>
                Tips Pengujian
              </Text>
            </View>
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              Gunakan email dan kata sandi yang telah Anda daftarkan. Pengguna diarahkan otomatis ke halaman Aslab, Asprak, atau Praktikan sesuai perannya.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
    gap: 6,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  formCard: {
    padding: 20,
    borderRadius: Radius.lg,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  promptText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  hintSection: {
    marginTop: Spacing.four,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintBadge: {
    ...Typography.caption,
    fontWeight: '700',
  },
  hintText: {
    ...Typography.caption,
    lineHeight: 18,
  },
});