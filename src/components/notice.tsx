// Banner umpan balik singkat (sukses/gagal) + indikator error/loading daftar.
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type NoticeData = { tipe: 'ok' | 'err'; teks: string } | null;

export function Notice({
  data,
  onRetry,
}: {
  data: NoticeData;
  onRetry?: () => void;
}) {
  if (!data) return null;
  const ok = data.tipe === 'ok';
  return (
    <View style={[styles.box, ok ? styles.ok : styles.err]}>
      <ThemedText type="small" style={[styles.text, ok ? styles.okText : styles.errText]}>
        {data.teks}
      </ThemedText>
      {!ok && onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.retryText}>Coba lagi</Text>
        </Pressable>
      ) : null}
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
  box: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: { flex: 1 },
  ok: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  err: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  okText: { color: '#15803D' },
  errText: { color: '#B91C1C' },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  retryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  loading: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
