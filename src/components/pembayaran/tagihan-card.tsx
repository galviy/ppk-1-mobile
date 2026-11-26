import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { tanggalDariIso } from '@/lib/format';
import type { Tagihan } from '@/services/pembayaran';

import { StatusPembayaranBadge } from './status-pembayaran-badge';

export const rupiah = (nominal: number) =>
  `Rp${Math.max(0, Math.round(nominal)).toLocaleString('id-ID')}`;

type Props = { tagihan: Tagihan; onPress?: () => void };

export function TagihanCard({ tagihan, onPress }: Props) {
  const tanggal = tagihan.tanggalSesi ? tanggalDariIso(tagihan.tanggalSesi) : '';
  const keterangan = [tagihan.namaLab, tanggal].filter(Boolean).join(' • ');

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold" style={styles.judul} numberOfLines={2}>
          {tagihan.namaPraktikum || 'Denda Praktikum'}
        </ThemedText>
        <StatusPembayaranBadge status={tagihan.statusPembayaran} />
      </View>
      {keterangan ? (
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {keterangan}
        </ThemedText>
      ) : null}
      <View style={styles.row}>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          Terlambat {tagihan.terlambatMenit} menit
        </ThemedText>
        <ThemedText type="smallBold" style={styles.nominal}>
          {rupiah(tagihan.nominal)}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  judul: { flex: 1, fontSize: 15 },
  meta: { fontSize: 13 },
  nominal: { fontSize: 15 },
});
