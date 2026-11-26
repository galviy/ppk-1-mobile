// Kerangka layar SRS-02: header identitas/logout milik SRS-01 (RoleHeader) + profil dari useAuth().
// Proteksi rute/peran ditangani NavigationGuard (SRS-01), jadi di sini hanya menyediakan profil.
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from './themed-view';
import { RoleHeader } from './ui/role-header';
import { useAuth } from '../context/AuthContext';
import type { Profil } from '../data/models';
import { normalizeRole } from '../data/types';

type Props = { children: React.ReactNode | ((profil: Profil) => React.ReactNode) };

export function ScreenShell({ children }: Props) {
  const { user } = useAuth();
  const profil: Profil | null = user
    ? {
        uid: user.uid,
        nama: user.nama,
        nim: user.nim,
        role: normalizeRole(user.role) ?? 'praktikan',
        ...(user.mataKuliahKode ? { mataKuliahKode: user.mataKuliahKode } : {}),
      }
    : null;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <RoleHeader />
        {profil ? (typeof children === 'function' ? children(profil) : children) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
