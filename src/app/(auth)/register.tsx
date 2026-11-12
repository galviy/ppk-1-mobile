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
import { Role } from '@/data/types';
import { getAuthErrorMessage } from '@/services/authService';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('praktikan');
  const [nim, setNim] = useState('');
  const [kelas, setKelas] = useState<'A' | 'B'>('A');
  const [nip, setNip] = useState('');

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
    if (role === 'praktikan' && !nim.trim()) {
      setErrorMessage('NIM wajib diisi untuk peran Praktikan.');
      return;
    }

    setIsLoading(true);
    try {
      // Registrasi akun Firebase Auth & simpan profil ke Firestore (FR-01.1, FR-01.4, FR-01.5, FR-01.6)
      const userProfile = await register({
        email,
        password,
        nama,
        role,
        nim: role === 'praktikan' ? nim : undefined,
        kelas: role === 'praktikan' ? kelas : undefined,
        nip: role === 'asisten' ? nip : undefined,
      });

      // Arahkan otomatis ke dashboard sesuai perannya (FR-01.8)
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
            {/* Header Back & Title */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backBtn,
                  pressed && styles.backBtnPressed,
                ]}>
                <Text style={styles.backBtnText}>← Kembali ke Login</Text>
              </Pressable>

              <ThemedText type="subtitle" style={styles.title}>
                Registrasi Akun Baru
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Daftar akun praktikum dan tentukan peran Anda sebagai Praktikan atau Asisten
              </ThemedText>
            </View>

            {/* Form Card */}
            <Card style={styles.formCard}>
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Pemilihan Peran (FR-01.6) */}
              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Pilih Peran Pengguna *</Text>
                <View style={styles.roleSelector}>
                  <Pressable
                    onPress={() => setRole('praktikan')}
                    style={[
                      styles.roleChip,
                      role === 'praktikan' && styles.roleChipActivePraktikan,
                    ]}>
                    <Text style={styles.roleChipEmoji}>🎓</Text>
                    <View>
                      <Text
                        style={[
                          styles.roleChipTitle,
                          role === 'praktikan' && styles.roleChipTextActive,
                        ]}>
                        Praktikan
                      </Text>
                      <Text
                        style={[
                          styles.roleChipDesc,
                          role === 'praktikan' && styles.roleChipTextActive,
                        ]}>
                        Mahasiswa peserta
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setRole('asisten')}
                    style={[
                      styles.roleChip,
                      role === 'asisten' && styles.roleChipActiveAsisten,
                    ]}>
                    <Text style={styles.roleChipEmoji}>👨‍🏫</Text>
                    <View>
                      <Text
                        style={[
                          styles.roleChipTitle,
                          role === 'asisten' && styles.roleChipTextActive,
                        ]}>
                        Asisten
                      </Text>
                      <Text
                        style={[
                          styles.roleChipDesc,
                          role === 'asisten' && styles.roleChipTextActive,
                        ]}>
                        Pengelola praktikum
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>

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
              {role === 'praktikan' && (
                <>
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
                    <Text style={styles.roleLabel}>Pilih Kelas Praktikum *</Text>
                    <View style={styles.kelasRow}>
                      {(['A', 'B'] as const).map((k) => {
                        const isSelected = kelas === k;
                        return (
                          <Pressable
                            key={k}
                            onPress={() => setKelas(k)}
                            style={[
                              styles.kelasChip,
                              isSelected && styles.kelasChipActive,
                            ]}>
                            <Text
                              style={[
                                styles.kelasChipText,
                                isSelected && styles.kelasChipTextActive,
                              ]}>
                              Kelas {k}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}

              {/* Field Khusus Asisten */}
              {role === 'asisten' && (
                <InputField
                  label="Kode Asisten / NIP (Opsional)"
                  value={nip}
                  onChangeText={setNip}
                  placeholder="Contoh: AST-01 / 198501..."
                  disabled={isLoading}
                />
              )}

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
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.loadingText}>Mendaftarkan akun Anda...</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label="Daftar Akun Sekarang →"
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
                  <Text style={styles.loginLink}>Masuk di sini</Text>
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
    borderRadius: 16,
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
  roleSection: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  roleChipActivePraktikan: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleChipActiveAsisten: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  roleChipEmoji: {
    fontSize: 24,
  },
  roleChipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  roleChipDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  roleChipTextActive: {
    color: '#0F172A',
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
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  kelasChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  kelasChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  kelasChipTextActive: {
    color: '#FFFFFF',
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
    color: '#2563EB',
  },
});

