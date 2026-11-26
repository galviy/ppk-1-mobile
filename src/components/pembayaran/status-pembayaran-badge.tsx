import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StatusPembayaran, StatusTransaksi } from '@/services/pembayaran';

type Props = { status: StatusPembayaran | StatusTransaksi };

const LABEL: Record<StatusPembayaran, string> = {
  unpaid: 'Belum Dibayar',
  pending: 'Menunggu Pembayaran',
  success: 'Lunas',
  failed: 'Gagal',
};

const GAYA: Record<StatusPembayaran, { box: object; teks: object }> = {
  unpaid: { box: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }, teks: { color: '#B91C1C' } },
  pending: { box: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }, teks: { color: '#B45309' } },
  success: { box: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }, teks: { color: '#15803D' } },
  failed: { box: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }, teks: { color: '#4B5563' } },
};

export function StatusPembayaranBadge({ status }: Props) {
  const gaya = GAYA[status] ?? GAYA.unpaid;
  return (
    <View style={[styles.badge, gaya.box]}>
      <Text style={[styles.text, gaya.teks]}>{LABEL[status] ?? LABEL.unpaid}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
