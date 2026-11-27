import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SemanticTone } from '../../constants/theme';
import type { StatusKehadiran, StatusPembayaran, StatusSesi } from '../../data/models';
import { useTheme } from '../../hooks/use-theme';

export type BadgeStatus = StatusSesi | StatusKehadiran | 'excused_absence' | StatusPembayaran;

export interface StatusBadgeProps {
  status: BadgeStatus;
}

const STATUS_META: Record<BadgeStatus, { label: string; tone: SemanticTone }> = {
  dibuka: { label: 'Dibuka', tone: 'success' },
  belum_dibuka: { label: 'Belum Dibuka', tone: 'warning' },
  ditutup: { label: 'Ditutup', tone: 'neutral' },
  tepat_waktu: { label: 'Tepat Waktu', tone: 'success' },
  terlambat: { label: 'Terlambat', tone: 'warning' },
  excused_absence: { label: 'Izin / Excused', tone: 'info' },
  unpaid: { label: 'Belum Dibayar', tone: 'danger' },
  pending: { label: 'Menunggu Pembayaran', tone: 'warning' },
  success: { label: 'Lunas', tone: 'success' },
  failed: { label: 'Gagal', tone: 'danger' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useTheme();
  const meta = STATUS_META[status] ?? { label: 'Belum Dibuka', tone: 'warning' as const };

  const tonePalette: Record<SemanticTone, { bg: string; border: string; text: string }> = {
    success: { bg: theme.successBg, border: theme.successBorder, text: theme.successText },
    warning: { bg: theme.warningBg, border: theme.warningBorder, text: theme.warningText },
    danger: { bg: theme.dangerBg, border: theme.dangerBorder, text: theme.dangerText },
    info: { bg: theme.infoBg, border: theme.infoBorder, text: theme.infoText },
    neutral: { bg: theme.neutralBg, border: theme.neutralBorder, text: theme.neutralText },
  };
  const palette = tonePalette[meta.tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={[styles.dot, { backgroundColor: palette.text }]} />
      <Text style={[styles.text, { color: palette.text }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
