import { Ionicons } from '@expo/vector-icons';
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const theme = useTheme();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nim, setNim] = useState('');
  const [kelas, setKelas] = useState<'A' | 'B'>('A');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setErrorMessage(null);

    // Validasi input
    if (!nama.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!nim.trim()) {
      setErrorMessage('NIM wajib diisi untuk peran Praktikan.');
      return;
    }

    setIsLoading(true);
    try {
      // Registrasi akun Firebase Auth & simpan profil ke Firestore (FR-01.1, FR-01.4, FR-01.5, FR-01.6)
      // Registrasi publik selalu 'praktikan'; akun Aslab dan Asprak dikelola secara aman (FR-04.4, FR-S4-01.3)
      const userProfile = await register({
        email,
        password,
        nama,
        role: 'praktikan',
        nim,
        kelas,
      });

      // Arahkan otomatis ke dashboard peran sah (FR-S4-01.4)
      router.replace(getHomeRouteForRole(userProfile.role) as Href);
    } catch (error: unknown) {
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
            {/* Header Back & Title */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backBtn,
                  {
                    backgroundColor: theme.secondaryBg,
                    borderColor: theme.secondaryBorder,
                  },
                  pressed && styles.backBtnPressed,
                ]}>
                <Ionicons
                  name="arrow-back"
                  size={15}
                  color={theme.secondaryText}
                />
                <Text
                  style={[styles.backBtnText, { color: theme.secondaryText }]}>
                  Kembali ke Login
                </Text>
              </Pressable>

              <ThemedText type="subtitle" style={styles.title}>
                Registrasi Akun Baru
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Daftar akun praktikan. Akun Aslab dan Asprak dikelola secara khusus.
              </ThemedText>
            </View>

            {/* Form Card */}
            <Card style={styles.formCard}>
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
                label="Nama Lengkap"
                value={nama}
                onChangeText={(text) => {
                  setNama(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Budi Santoso"
                autoCapitalize="words"
                required
                disabled={isLoading}
              />

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

              {/* Field Khusus Praktikan */}
              <InputField
                label="NIM (Nomor Induk Mahasiswa)"
                value={nim}
                onChangeText={(text) => {
                  setNim(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: 21120120140001"
                keyboardType="number-pad"
                required
                disabled={isLoading}
              />

              <View style={styles.kelasSection}>
                <Text style={[styles.roleLabel, { color: theme.text }]}>
                  Pilih Kelas Praktikum *
                </Text>
                <View style={styles.kelasRow}>
                  {(['A', 'B'] as const).map((k) => {
                    const isSelected = kelas === k;
                    return (
                      <Pressable
                        key={k}
                        onPress={() => setKelas(k)}
                        style={[
                          styles.kelasChip,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.backgroundElement,
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.kelasChipText,
                            {
                              color: isSelected
                                ? theme.onPrimary
                                : theme.textSecondary,
                            },
                          ]}>
                          Kelas {k}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

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

              <InputField
                label="Konfirmasi Kata Sandi"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Masukkan ulang kata sandi"
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
                      Mendaftarkan akun Anda...
                    </Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label="Daftar Akun Sekarang"
                    onPress={handleRegister}
                  />
                )}
              </View>

              {/* Link ke Login */}
              <View style={styles.loginPrompt}>
                <ThemedText themeColor="textSecondary" style={styles.promptText}>
                  Sudah memiliki akun?{' '}
                </ThemedText>
                <Pressable
                  onPress={() => router.replace('/(auth)/login')}
                  hitSlop={8}>
                  <Text style={[styles.loginLink, { color: theme.primaryText }]}>
                    Masuk di sini
                  </Text>
                </Pressable>
              </View>
            </Card>
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  header: {
    marginBottom: Spacing.three,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: 12,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  backBtnText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  formCard: {
    padding: 20,
    borderRadius: Radius.lg,
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
  roleLabel: {
    ...Typography.label,
    marginBottom: 8,
  },
  kelasSection: {
    marginBottom: 16,
  },
  kelasRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kelasChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kelasChipText: {
    ...Typography.label,
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
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  promptText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

