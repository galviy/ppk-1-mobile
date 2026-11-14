import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LeaveStatusBadge } from '@/components/izin/leave-status-badge';
import { Card } from '@/components/ui/card';
import { SENTIMENT_LABEL, type Izin } from '@/data/izin-types';
import { useTheme } from '@/hooks/use-theme';
import { tanggalDariIso } from '@/lib/format';

type Props = {
  izin: Izin;
  namaPraktikum?: string;
  tanggalSesi?: string; // YYYY-MM-DD
  namaKelas?: string;
  showParticipant?: boolean;
  onPress?: () => void;
};

export function LeaveRequestCard({
  izin,
  namaPraktikum,
  tanggalSesi,
  namaKelas,
  showParticipant = false,
  onPress,
}: Props) {
  const theme = useTheme();
  const sentimentLabel = izin.sentimen?.label ? SENTIMENT_LABEL[izin.sentimen.label] : null;
  const judulSesi = namaPraktikum ?? 'Sesi praktikum';
  const infoKelas = namaKelas ?? 'Kelas';
  const infoTanggal = tanggalSesi ? tanggalDariIso(tanggalSesi) : '—';

  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          {showParticipant && (
            <Text style={[styles.participant, { color: theme.text }]}>
              {izin.nama} • {infoKelas}
            </Text>
          )}
          <Text style={[styles.title, { color: theme.text }]}>{judulSesi}</Text>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {!showParticipant && namaKelas ? `${namaKelas} • ` : ''}
            {infoTanggal}
          </Text>
        </View>
        <LeaveStatusBadge status={izin.status} />
      </View>

      <Text style={[styles.reason, { color: theme.textSecondary }]} numberOfLines={2}>
        {izin.alasan}
      </Text>

      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        Sentimen (eksperimental): {sentimentLabel ?? 'belum tersedia'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  titleWrap: { flex: 1, gap: 2 },
  participant: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12 },
  reason: { fontSize: 13, lineHeight: 18, marginTop: 10, marginBottom: 6 },
});
