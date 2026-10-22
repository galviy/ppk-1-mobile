import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useApp } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

export function RoleHeader() {
  const { role, identitas, gantiPeran } = useApp();
  const theme = useTheme();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const roleLabel =
    role === 'praktikan'
      ? `Praktikan${identitas?.kelas ? ` — Kelas ${identitas.kelas}` : ''}`
      : 'Asisten Laboratorium';

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
          <ThemedText type="smallBold" style={styles.userName}>
            {identitas?.nama ?? 'Pengguna Dummy'}
          </ThemedText>
          <Text style={styles.roleTag}>{roleLabel}</Text>
        </View>

        <Pressable
          onPress={() => setShowConfirmModal(true)}
          style={({ pressed }) => [
            styles.switchBtn,
            pressed && styles.switchBtnPressed,
          ]}>
          <Text style={styles.switchBtnText}>Ganti Peran</Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={showConfirmModal}
        title="Ganti Peran Pengguna"
        message="Apakah Anda yakin ingin kembali ke menu utama dan mengganti peran atau identitas akun?"
        confirmLabel="Ya, Ganti Peran"
        cancelLabel="Batal"
        variant="danger"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          gantiPeran();
        }}
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
  userName: {
    fontSize: 15,
  },
  roleTag: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  switchBtnPressed: {
    opacity: 0.7,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
});
