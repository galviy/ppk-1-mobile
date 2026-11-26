// Ringkasan hasil pemeriksaan lokasi: izin, GPS, akurasi, jarak, dan radius (S3-02.2).
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import type { StatusIzin } from '@/hooks/use-location';
import { AKURASI_MAKS_METER, type HasilLokasi as HasilEvaluasi, type LokasiInput } from '@/lib/geo';

type Status = 'ok' | 'gagal' | 'netral';

function Baris({ label, nilai, status }: { label: string; nilai: string; status: Status }) {
  const warna = status === 'ok' ? '#15803D' : status === 'gagal' ? '#B91C1C' : undefined;
  const ikon = status === 'ok' ? '✓ ' : status === 'gagal' ? '✗ ' : '';
  return (
    <View style={styles.row}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.nilai, warna ? { color: warna } : null]}>
        {ikon}
        {nilai}
      </ThemedText>
    </View>
  );
}

type Props = {
  statusIzin: StatusIzin;
  gpsAktif: boolean | null;
  lokasi: LokasiInput | null;
  radiusMeter: number | null;
  hasil: HasilEvaluasi | null;
};

export function HasilLokasi({ statusIzin, gpsAktif, lokasi, radiusMeter, hasil }: Props) {
  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">Pemeriksaan lokasi</ThemedText>
      <Baris
        label="Izin lokasi"
        status={statusIzin === 'diberikan' ? 'ok' : statusIzin === 'belum' ? 'netral' : 'gagal'}
        nilai={statusIzin === 'diberikan' ? 'Diberikan' : statusIzin === 'belum' ? 'Memeriksa…' : 'Ditolak'}
      />
      <Baris
        label="Layanan lokasi (GPS)"
        status={gpsAktif === null ? 'netral' : gpsAktif ? 'ok' : 'gagal'}
        nilai={gpsAktif === null ? '—' : gpsAktif ? 'Aktif' : 'Mati'}
      />
      <Baris
        label="Akurasi"
        status={!lokasi ? 'netral' : hasil ? (hasil.akurasiOk ? 'ok' : 'gagal') : 'netral'}
        nilai={
          lokasi?.akurasiMeter != null
            ? `±${Math.round(lokasi.akurasiMeter)} m (maks ${AKURASI_MAKS_METER} m)`
            : lokasi
              ? 'Tidak diketahui'
              : 'Mencari lokasi…'
        }
      />
      <Baris
        label="Jarak ke laboratorium"
        status={hasil ? (hasil.dalamRadius ? 'ok' : 'gagal') : 'netral'}
        nilai={
          hasil
            ? `${Math.round(hasil.jarakMeter)} m (radius ${Math.round(radiusMeter ?? 0)} m)`
            : radiusMeter
              ? `— (radius ${Math.round(radiusMeter)} m)`
              : '—'
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  label: { fontSize: 13, flexShrink: 1 },
  nilai: { fontSize: 13, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
});
