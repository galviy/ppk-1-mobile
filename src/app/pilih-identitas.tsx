import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';
import { Asisten, Praktikan, Role, UserIdentitas } from '@/data/types';

export default function PilihIdentitasScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const {
    role: contextRole,
    setRole,
    setIdentitas,
    daftarPraktikan,
    daftarAsisten,
  } = useApp();

  const activeRole: Role = (params.role as Role) || contextRole || 'praktikan';
  const isPraktikan = activeRole === 'praktikan';

  const [selectedUser, setSelectedUser] = useState<UserIdentitas | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleSelect = (user: Praktikan | Asisten) => {
    setErrorMsg(null);
    if ('kelas' in user) {
      setSelectedUser({
        id: user.id,
        nama: user.nama,
        kelas: user.kelas,
      });
    } else {
      setSelectedUser({
        id: user.id,
        nama: user.nama,
      });
    }
  };

  const handleLanjut = () => {
    if (!selectedUser) {
      setErrorMsg('Silakan pilih salah satu identitas dummy terlebih dahulu.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmEntry = () => {
    setShowConfirmModal(false);
    if (!selectedUser) return;

    setRole(activeRole);
    setIdentitas(selectedUser);

    if (isPraktikan) {
      router.replace('/praktikan');
    } else {
      router.replace('/asisten');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Back Header */}
        <View style={styles.navHeader}>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}>
            <ThemedText type="smallBold" style={styles.backBtnText}>
              ← Ganti Peran
            </ThemedText>
          </Pressable>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View
            style={[
              styles.roleBadge,
              isPraktikan ? styles.praktikanBadge : styles.asistenBadge,
            ]}>
            <Text
              style={[
                styles.roleBadgeText,
                isPraktikan ? styles.textBlue : styles.textAmber,
              ]}>
              {isPraktikan ? 'Peran: Praktikan' : 'Peran: Asisten'}
            </Text>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Pilih Identitas Dummy
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {isPraktikan
              ? 'Pilih salah satu mahasiswa praktikan untuk menguji kelas dan kehadiran:'
              : 'Pilih salah satu asisten untuk menguji pengelolaan sesi & rekap:'}
          </ThemedText>
        </View>

        {/* List of Dummy Users */}
        <FlatList
          data={isPraktikan ? daftarPraktikan : daftarAsisten}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedUser?.id === item.id;
            const hasKelas = 'kelas' in item;

            return (
              <Card
                selected={isSelected}
                onPress={() => handleSelect(item)}
                style={styles.cardItem}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.nama.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <ThemedText type="smallBold" style={styles.userName}>
                      {item.nama}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.userId}>
                      ID: {item.id}
                    </ThemedText>
                  </View>

                  {hasKelas && (
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>
                        Kelas {(item as Praktikan).kelas}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </Card>
            );
          }}
        />

        {/* Error notification if validation fails */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Action Button Footer */}
        <View style={styles.footer}>
          <PrimaryButton
            label={
              selectedUser
                ? `Masuk sebagai ${selectedUser.nama} →`
                : 'Pilih Identitas Dummy'
            }
            onPress={handleLanjut}
            disabled={!selectedUser}
          />
        </View>

        {/* Modal Konfirmasi Masuk Dashboard */}
        <ConfirmModal
          visible={showConfirmModal}
          title="Konfirmasi Identitas"
          message={`Anda akan masuk sebagai ${selectedUser?.nama ?? ''} (${isPraktikan
              ? `Praktikan Kelas ${selectedUser?.kelas ?? ''}`
              : 'Asisten Laboratorium'
            }). Lanjutkan ke halaman utama?`}
          confirmLabel="Lanjut Masuk"
          cancelLabel="Batal"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmEntry}
        />
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
    paddingHorizontal: Spacing.four,
  },
  navHeader: {
    paddingVertical: Spacing.two,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  backBtnText: {
    fontSize: 13,
    color: '#334155',
  },
  titleSection: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
  },
  praktikanBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  asistenBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textBlue: {
    color: '#1D4ED8',
  },
  textAmber: {
    color: '#B45309',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  cardItem: {
    marginVertical: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
  },
  userId: {
    fontSize: 12,
    marginTop: 2,
  },
  classBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.three,
  },
});
