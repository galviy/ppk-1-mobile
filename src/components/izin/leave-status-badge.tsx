import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { STATUS_IZIN_LABEL, type StatusIzin } from '@/data/izin-types';

const PALETTE: Record<StatusIzin, { bg: string; border: string; fg: string }> = {
  menunggu: { bg: '#FEF3C7', border: '#FDE68A', fg: '#B45309' },
  diterima: { bg: '#DCFCE7', border: '#86EFAC', fg: '#15803D' },
  ditolak: { bg: '#FEE2E2', border: '#FCA5A5', fg: '#B91C1C' },
};

export function LeaveStatusBadge({ status }: { status: StatusIzin }) {
  const c = PALETTE[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.text, { color: c.fg }]}>{STATUS_IZIN_LABEL[status]}</Text>
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
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
