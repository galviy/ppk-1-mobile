// Banner umpan balik singkat (sukses/gagal) + indikator error/loading daftar.
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type NoticeData = { tipe: 'ok' | 'err'; teks: string } | null;

export function Notice({ data }: { data: NoticeData }) {
  if (!data) return null;
  const ok = data.tipe === 'ok';
  return (
    <View style={[styles.box, ok ? styles.ok : styles.err]}>
      <ThemedText type="small" style={ok ? styles.okText : styles.errText}>
        {data.teks}
      </ThemedText>
    </View>
  );
}

export function LoadingRow({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator />
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1 },
  ok: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  err: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  okText: { color: '#15803D' },
  errText: { color: '#B91C1C' },
  loading: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
