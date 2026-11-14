// Detail pengajuan izin & panel keputusan asisten (SRS-03: FR-03.13, FR-03.14, FR-03.15, FR-03.16).
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LeaveStatusBadge } from '@/components/izin/leave-status-badge';
import { SentimentResultBox } from '@/components/izin/sentiment-result-box';
import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { STATUS_IZIN_LABEL } from '@/data/izin-types';
import type { Profil } from '@/data/models';
import { useIzinDetail } from '@/hooks/use-izin';
import { useKelasDetail, useSesiDetail } from '@/hooks/use-praktikum';
import { jamMenit, tanggalDariIso, tanggalPendek } from '@/lib/format';
import { pesanErrorIzin, putuskanIzin } from '@/services/izin';

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      {typeof children === 'string' ? (
        <ThemedText style={styles.value}>{children}</ThemedText>
      ) : (
        children
      )}
    </View>
  );
}

export default function DetailIzinScreen() {
  const { user, isLoading } = useAuth();
  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const izin = useIzinDetail(id ?? null);
  const sesi = useSesiDetail(izin.data?.sesiId ?? null);
  const kelas = useKelasDetail(izin.data?.kelasId ?? null);

  const [konfirmasi, setKonfirmasi] = useState<'diterima' | 'ditolak' | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeData>(null);
  const sedangPutuskanRef = useRef(false);

  const error = izin.error ?? sesi.error ?? kelas.error;

  const eksekusiKeputusan = async () => {
    if (!konfirmasi || !izin.data || sedangPutuskanRef.current) return;
    const keputusanTarget = konfirmasi;
    setKonfirmasi(null);
    sedangPutuskanRef.current = true;
    setBusy(true);
    setNotice(null);

    try {
      await putuskanIzin(izin.data.id, keputusanTarget, profil);
      setNotice({
        tipe: 'ok',
        teks:
          keputusanTarget === 'diterima'
            ? 'Pengajuan izin berhasil diterima.'
            : 'Pengajuan izin berhasil ditolak.',
      });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanErrorIzin(e) });
    } finally {
      sedangPutuskanRef.current = false;
      setBusy(false);
    }
  };

  const data = izin.data;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Detail Izin' }} />
      <Pressable onPress={() => router.back()}>
        <ThemedText type="smallBold" style={styles.back}>
          ← Kembali
        </ThemedText>
      </Pressable>

      <Notice data={notice ?? (error ? { tipe: 'err', teks: error } : null)} />

      {izin.loading ? (
        <LoadingRow />
      ) : !data ? (
        <EmptyState
          title="Pengajuan izin tidak ditemukan"
          message="Data izin mungkin tidak tersedia atau Anda tidak memiliki akses."
        />
      ) : (
        <>
          <Card style={styles.card}>
            <Baris label="Praktikan">{data.nama}</Baris>
            <Baris label="Kelas">{kelas.data?.nama ?? '—'}</Baris>
            <Baris label="Praktikum">{sesi.data?.namaPraktikum ?? '—'}</Baris>
            <Baris label="Tanggal Sesi">
              {sesi.data ? tanggalDariIso(sesi.data.tanggal) : '—'}
            </Baris>
            <Baris label="Jam Sesi">
              {sesi.data ? `${sesi.data.jamMulai}–${sesi.data.jamSelesai}` : '—'}
            </Baris>
            <Baris label="Diajukan pada">
              {data.diajukanPada
                ? `${tanggalPendek(data.diajukanPada)}, ${jamMenit(data.diajukanPada)}`
                : '—'}
            </Baris>
            <Baris label="Status">
              <LeaveStatusBadge status={data.status} />
            </Baris>
            {data.status !== 'menunggu' && data.diputuskanPada ? (
              <Baris label="Diputuskan pada">
                {`${tanggalPendek(data.diputuskanPada)}, ${jamMenit(data.diputuskanPada)}`}
              </Baris>
            ) : null}
          </Card>

          <Card style={styles.reasonCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Alasan Ketidakhadiran
            </ThemedText>
            <ThemedText style={styles.reasonText}>{data.alasan}</ThemedText>
          </Card>

          <SentimentResultBox sentiment={data.sentimen} />

          {profil.role === 'asisten' ? (
            <View style={styles.actionSection}>
              {data.status === 'menunggu' ? (
                <View style={styles.actionRow}>
                  <PrimaryButton
                    label={busy ? 'Memproses…' : 'Tolak Izin'}
                    variant="danger"
                    disabled={busy}
                    onPress={() => setKonfirmasi('ditolak')}
                    style={styles.flex}
                  />
                  <PrimaryButton
                    label={busy ? 'Memproses…' : 'Terima Izin'}
                    variant="primary"
                    disabled={busy}
                    onPress={() => setKonfirmasi('diterima')}
                    style={styles.flex}
                  />
                </View>
              ) : (
                <PrimaryButton
                  label={`Keputusan telah disimpan: ${STATUS_IZIN_LABEL[data.status]}`}
                  onPress={() => {}}
                  disabled
                />
              )}
            </View>
          ) : null}

          <ConfirmModal
            visible={konfirmasi !== null}
            title={
              konfirmasi === 'diterima'
                ? 'Terima pengajuan izin ini?'
                : 'Tolak pengajuan izin ini?'
            }
            message={`${data.nama} (${kelas.data?.nama ?? 'Kelas'}) — ${
              sesi.data?.namaPraktikum ?? 'Sesi praktikum'
            }. Keputusan bersifat final dan tidak dapat diubah kembali.`}
            confirmLabel={konfirmasi === 'diterima' ? 'Ya, Terima' : 'Ya, Tolak'}
            variant={konfirmasi === 'diterima' ? 'primary' : 'danger'}
            onCancel={() => setKonfirmasi(null)}
            onConfirm={() => void eksekusiKeputusan()}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 14,
  },
  back: { color: '#2563EB' },
  card: { gap: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: { fontSize: 14 },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  reasonCard: { gap: 8 },
  sectionTitle: { fontSize: 14 },
  reasonText: { fontSize: 14, lineHeight: 20 },
  actionSection: { marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 12 },
});
