import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { ConfirmModal } from './confirm-modal';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../data/store';
import { CanonicalRole, normalizeRole } from '../../data/types';
import { useTheme } from '../../hooks/use-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function RoleHeader() {
  const { user, logout } = useAuth();
  const { role, identitas, keluarAkun } = useApp();
  const theme = useTheme();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const namaTampil = user?.nama || identitas?.nama || 'Pengguna';
  const roleAktif: CanonicalRole = normalizeRole(user?.role ?? role) ?? 'praktikan';
  const kelasAktif = user?.kelas || identitas?.kelas;
  const nimAktif = user?.nim;
  const nipAktif = user?.nip;
  const mkAktif = user?.mataKuliahKode;

  let roleLabel = '';
  let badgeTitle = '';
  let roleIcon: IconName = 'person-outline';
  let badgeColors: { bg: string; border: string; text: string } = {
    bg: theme.primaryBg,
    border: theme.primaryBorder,
    text: theme.primaryText,
  };

  if (roleAktif === 'aslab') {
    badgeTitle = 'Aslab';
    roleIcon = 'flask-outline';
    roleLabel = `Asisten Laboratorium${mkAktif ? ` • ${mkAktif}` : ''}${
      nipAktif ? ` (${nipAktif})` : ''
    }`;
    badgeColors = {
      bg: theme.infoBg,
      border: theme.infoBorder,
      text: theme.infoText,
    };
  } else if (roleAktif === 'asprak') {
    badgeTitle = 'Asprak';
    roleIcon = 'clipboard-outline';
    roleLabel = `Asisten Praktikum${nipAktif ? ` (${nipAktif})` : ''}`;
    badgeColors = {
      bg: theme.warningBg,
      border: theme.warningBorder,
      text: theme.warningText,
    };
  } else {
    badgeTitle = 'Praktikan';
    roleIcon = 'person-outline';
    roleLabel = `Praktikan${kelasAktif ? ` • Kelas ${kelasAktif}` : ''}${
      nimAktif ? ` (${nimAktif})` : ''
    }`;
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
            borderBottomColor: theme.borderSubtle,
          },
        ]}>
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: badgeColors.bg,
                  borderColor: badgeColors.border,
                },
              ]}>
              <Ionicons name={roleIcon} size={13} color={badgeColors.text} />
              <Text style={[styles.roleBadgeText, { color: badgeColors.text }]}>
                {badgeTitle}
              </Text>
            </View>
            <ThemedText type="smallBold" style={styles.userName} numberOfLines={1}>
              {namaTampil}
            </ThemedText>
          </View>
          <Text
            style={[styles.roleTag, { color: theme.textSecondary }]}
            numberOfLines={1}>
            {roleLabel}
          </Text>
        </View>

        {/* Tombol Logout (FR-01.3) */}
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari akun"
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: theme.dangerBg,
              borderColor: theme.dangerBorder,
            },
            pressed && styles.logoutBtnPressed,
          ]}>
          <Ionicons name="log-out-outline" size={14} color={theme.dangerText} />
          <Text style={[styles.logoutBtnText, { color: theme.dangerText }]}>
            Keluar
          </Text>
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
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userName: {
    fontSize: 15,
    flexShrink: 1,
  },
  roleTag: {
    ...Typography.caption,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  logoutBtnPressed: {
    opacity: 0.75,
  },
  logoutBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
