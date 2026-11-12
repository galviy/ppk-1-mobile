import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

export function RoleHeader() {
  const { user, logout } = useAuth();
  const { role, identitas, keluarAkun } = useApp();
  const theme = useTheme();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const namaTampil = user?.nama || identitas?.nama || 'Pengguna';
  const roleAktif = user?.role || role || 'praktikan';
  const kelasAktif = user?.kelas || identitas?.kelas;
  const nimAktif = user?.nim;

  let roleLabel = '';
  if (roleAktif === 'praktikan') {
    roleLabel = `Praktikan${kelasAktif ? ` • Kelas ${kelasAktif}` : ''}${
      nimAktif ? ` (${nimAktif})` : ''
    }`;
  } else {
    roleLabel = 'Asisten Laboratorium';
  }

  const handleLogout = async () => {
    setShowConfirmModal(false);
    if (keluarAkun) {
      await keluarAkun();
    } else {
      await logout();
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundElement,
            borderBottomColor: theme.backgroundSelected,
          },
        ]}>
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userIcon}>
              {roleAktif === 'praktikan' ? '🎓' : '👨‍🏫'}
            </Text>
            <ThemedText type="smallBold" style={styles.userName} numberOfLines={1}>
              {namaTampil}
            </ThemedText>
          </View>
          <Text style={styles.roleTag}>{roleLabel}</Text>
        </View>

        {/* Tombol Logout (FR-01.3) */}
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}>
          <Text style={styles.logoutBtnText}>Keluar 🚪</Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Keluar dari Akun"
        message="Apakah Anda yakin ingin keluar dari sesi akun ini dan kembali ke halaman login?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="danger"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 15,
    flexShrink: 1,
  },
  roleTag: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnPressed: {
    opacity: 0.7,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
