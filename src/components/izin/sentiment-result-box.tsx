import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { SENTIMENT_LABEL, type ReasonSentiment } from '@/data/izin-types';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  sentiment: ReasonSentiment | null;
  loading?: boolean;
};

function messageFor(sentiment: ReasonSentiment | null): string | null {
  if (!sentiment) return 'Analisis sentimen belum tersedia.';
  switch (sentiment.status) {
    case 'predicted':
      return null;
    case 'unknown_vocabulary':
      return 'Teks terlalu singkat atau katanya tidak dikenali model, jadi hasil belum tersedia. Pengajuan tetap bisa dikirim.';
    case 'empty_input':
      return 'Tulis alasan terlebih dahulu untuk dianalisis.';
    case 'error':
      return 'Analisis tidak dapat dijalankan. Pengajuan tetap bisa dikirim dan diperiksa manual oleh asisten.';
  }
}

export function SentimentResultBox({ sentiment, loading = false }: Props) {
  const theme = useTheme();
  const message = messageFor(sentiment);

  return (
    <View style={[styles.box, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.text }]}>Analisis sentimen (eksperimental)</Text>

      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" />
          <Text style={[styles.body, { color: theme.textSecondary }]}>Menganalisis alasan…</Text>
        </View>
      ) : message ? (
        <Text style={[styles.body, { color: theme.textSecondary }]}>{message}</Text>
      ) : (
        <View style={styles.row}>
          <Text style={[styles.body, { color: theme.textSecondary }]}>Hasil model:</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {sentiment?.label ? SENTIMENT_LABEL[sentiment.label] : '-'}
            </Text>
          </View>
        </View>
      )}

      <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
        Hasil ini hanya informasi pendukung dari model lokal. Bukan penilaian izin dan tidak
        menentukan keputusan asisten.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, padding: 14, gap: 8 },
  title: { fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { fontSize: 13, lineHeight: 18, flexShrink: 1 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: '#E2E8F0',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  disclaimer: { fontSize: 11, lineHeight: 16 },
});
