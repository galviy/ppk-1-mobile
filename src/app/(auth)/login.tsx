import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/services/authService';

export default function LoginScreen() {
  const { login } = useAuth();

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
      // Proses autentikasi via Firebase (FR-01.2 & FR-01.7)
      const userProfile = await login(email, password);

      // Arahkan ke dashboard sesuai peran pengguna (FR-01.8)
      if (userProfile.role === 'praktikan') {
        router.replace('/praktikan');
      } else {
        router.replace('/asisten');
      }
    } catch (error: any) {
      // Tampilkan pesan error yang deskriptif (FR-01.10)
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Header Brand */}
            <View style={styles.brandHeader}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoEmoji}>🔬</Text>
              </View>
              <ThemedText type="subtitle" style={styles.title}>
                Praktikum PPK
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Masuk ke akun Anda untuk mengakses jadwal, presensi, dan pengelolaan sesi
              </ThemedText>
            </View>

            {/* Form Card */}
            <Card style={styles.formCard}>
              <ThemedText type="smallBold" style={styles.formTitle}>
                Masuk ke Akun
              </ThemedText>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
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
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.loadingText}>Memverifikasi akun...</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label="Masuk Sekarang →"
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
                  <Text style={styles.registerLink}>Daftar Akun Baru</Text>
                </Pressable>
              </View>
            </Card>

            {/* Quick Demo Hint */}
            <View style={styles.hintSection}>
              <Text style={styles.hintBadge}>💡 Tips Pengujian</Text>
              <Text style={styles.hintText}>
                Gunakan email dan kata sandi yang telah Anda daftarkan. Pengguna akan diarahkan otomatis ke halaman Praktikan atau Asisten sesuai perannya.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    justifyContent: 'center',
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 32,
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
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    color: '#2563EB',
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
    color: '#2563EB',
  },
  hintSection: {
    marginTop: Spacing.four,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hintBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});

