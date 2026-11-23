// Halaman presensi (S3-02.2 – S3-02.6): info sesi, status, pemeriksaan lokasi, dan tombol presensi.
// Tombol hanya aktif bila sesi dibuka DAN lokasi memenuhi radius laboratorium; keputusan akhir
// tetap divalidasi ulang di dalam transaksi catatPresensi dan Security Rules.
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { HasilLokasi } from '@/components/presensi/hasil-lokasi';
import { PermissionNotice } from '@/components/device/PermissionNotice';
import PresensiMap from '@/components/presensi/PresensiMap';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Profil } from '@/data/models';
import { useCurrentLocation } from '@/hooks/use-location';
import { useLabRef } from '@/hooks/use-lab-ref';
import { useKelasDetail, usePresensiSaya, useSesiDetail } from '@/hooks/use-praktikum';
import { jamDetik, tanggalDariIso } from '@/lib/format';
import { evaluasiLokasi } from '@/lib/geo';
import { DuplikatError, pesanError } from '@/lib/validasi';
import { classifyDeviceError } from '@/lib/device-errors';
import { catatPresensi } from '@/services/praktikum';

export default function PresensiScreen() {
  return (
    <ScreenShell>
      {(p) =>
        p.role === 'praktikan' ? (
          <Isi profil={p} />
        ) : (
          <EmptyState title="Khusus praktikan" message="Halaman presensi hanya untuk praktikan. Asisten melihat rekap di tab Rekap." />
        )
      }
    </ScreenShell>
  );
}

function Isi({ profil }: { profil: Profil }) {
  const { sesiId } = useLocalSearchParams<{ sesiId: string }>();
  const sesi = useSesiDetail(sesiId ?? null);
  const kelas = useKelasDetail(sesi.data?.kelasId ?? null);
  const lab = useLabRef(sesi.data?.laboratoriumId ?? null);
  const saya = usePresensiSaya(sesiId ? [sesiId] : [], profil.uid);
  const loc = useCurrentLocation({ watch: true });

  const [konfirmasi, setKonfirmasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [hasil, setHasil] = useState<NoticeData>(null);
  const [hasilOffline, setHasilOffline] = useState(false);
  const sedangKirim = useRef(false);

  const entri = sesiId ? saya.data[sesiId] : undefined;
  const evaluasi = lab.data && loc.lokasi ? evaluasiLokasi(loc.lokasi, lab.data) : null;

  // ---- alasan tombol nonaktif, berurutan menurut prioritas ----
  let jenisLokasi: 'lokasi' | 'gps' | 'lokasi-belum-ada' | null = null;
  let alasan: string | null = null;
  if (entri) alasan = null;
  else if (!sesi.data) alasan = null;
  else if (sesi.data.status === 'belum_dibuka') alasan = 'Sesi belum dibuka oleh asisten.';
  else if (sesi.data.status === 'ditutup') alasan = 'Sesi sudah ditutup.';
  else if (!sesi.data.laboratoriumId) alasan = 'Sesi ini belum ditautkan ke laboratorium. Hubungi asisten.';
  else if (!lab.loading && !lab.data) alasan = 'Data laboratorium tidak ditemukan. Hubungi asisten.';
  else if (loc.statusIzin === 'ditolak' || loc.statusIzin === 'ditolak-permanen') jenisLokasi = 'lokasi';
  else if (loc.gpsAktif === false) jenisLokasi = 'gps';
  else if (!loc.lokasi && !loc.loading) jenisLokasi = 'lokasi-belum-ada';
  else if (evaluasi && !evaluasi.boleh) alasan = evaluasi.alasan;

  const siapPresensi =
    !entri && sesi.data?.status === 'dibuka' && !!sesi.data.laboratoriumId && !!lab.data &&
    !lab.loading && !!loc.lokasi && !!evaluasi?.boleh && !mengirim && !sesi.loading && !sesi.error;

  const kirimPresensi = async () => {
    if (sedangKirim.current || !sesiId || !loc.lokasi) return; // cegah double-tap
    sedangKirim.current = true;
    setMengirim(true);
    setHasil(null);
    setHasilOffline(false);
    try {
      await catatPresensi(sesiId, profil, loc.lokasi);
      saya.retry();
      setHasil({ tipe: 'ok', teks: 'Presensi berhasil dicatat. Terima kasih!' });
    } catch (e) {
      setHasilOffline(classifyDeviceError(e) === 'offline');
      setHasil({
        tipe: e instanceof DuplikatError ? 'ok' : 'err',
        teks: pesanError(e),
      });
    } finally {
      sedangKirim.current = false;
      setMengirim(false);
    }
  };

  const adaSalahMuat = sesi.error ?? kelas.error ?? lab.error ?? saya.error;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Presensi' }} />
      <Pressable onPress={() => router.back()}>
        <ThemedText type="smallBold" style={styles.back}>← Kembali</ThemedText>
      </Pressable>

      <Notice
        data={adaSalahMuat ? { tipe: 'err', teks: adaSalahMuat } : null}
        onRetry={() => { sesi.retry(); kelas.retry(); lab.retry(); saya.retry(); }}
      />

      {sesi.loading ? (
        <LoadingRow />
      ) : !sesi.data ? (
        <EmptyState title="Sesi tidak ditemukan" message="Sesi ini mungkin sudah dihapus atau bukan untuk kelas Anda." />
      ) : (
        <>
          <Card style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={styles.judul}>{sesi.data.namaPraktikum}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.kecil}>
                  {kelas.data?.nama ?? '—'} • {tanggalDariIso(sesi.data.tanggal)}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.kecil}>
                  {sesi.data.jamMulai}–{sesi.data.jamSelesai} WIB
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.kecil}>
                  Laboratorium: {lab.data?.nama ?? (sesi.data.laboratoriumId ? '…' : 'belum ditentukan')}
                </ThemedText>
              </View>
              <StatusBadge status={sesi.data.status} />
            </View>
          </Card>

          {entri ? (
            <Card style={styles.sukses}>
              <ThemedText style={styles.suksesJudul}>✓ Presensi tercatat</ThemedText>
              <ThemedText type="small" style={styles.suksesTeks}>
                Hadir pukul {entri.waktu ? jamDetik(entri.waktu) : '…'}
                {entri.jarakMeter != null ? ` • ${Math.round(entri.jarakMeter)} m dari laboratorium` : ''}
              </ThemedText>
            </Card>
          ) : null}

          {!entri && sesi.data.laboratoriumId ? (
            <>
              <HasilLokasi
                statusIzin={loc.statusIzin}
                gpsAktif={loc.gpsAktif}
                lokasi={loc.lokasi}
                radiusMeter={lab.data?.radiusMeter ?? null}
                hasil={evaluasi}
              />
              {lab.data ? (
                <PresensiMap
                  lab={{ latitude: lab.data.latitude, longitude: lab.data.longitude, radiusMeter: lab.data.radiusMeter, nama: lab.data.nama }}
                  pengguna={loc.lokasi}
                />
              ) : null}
            </>
          ) : null}

          {!entri && jenisLokasi ? <PermissionNotice jenis={jenisLokasi} onRetry={loc.refresh} /> : null}
          {!entri && !jenisLokasi && loc.error ? (
            <PermissionNotice jenis="lokasi-belum-ada" pesan={loc.error} onRetry={loc.refresh} />
          ) : null}
          {!entri && alasan ? <Notice data={{ tipe: 'err', teks: alasan }} onRetry={loc.refresh} /> : null}
          {hasil?.tipe === 'err' && hasilOffline ? (
            <PermissionNotice jenis="offline" pesan={hasil.teks} onRetry={() => void kirimPresensi()} />
          ) : (
            <Notice data={hasil} onRetry={hasil?.tipe === 'err' ? () => void kirimPresensi() : undefined} />
          )}

          {!entri ? (
            <PrimaryButton
              label={mengirim ? 'Mencatat…' : 'Presensi Sekarang'}
              disabled={!siapPresensi}
              onPress={() => setKonfirmasi(true)}
            />
          ) : null}
        </>
      )}

      <ConfirmModal
        visible={konfirmasi}
        title="Catat presensi sekarang?"
        message={
          evaluasi
            ? `Anda berada ${Math.round(evaluasi.jarakMeter)} m dari ${lab.data?.nama ?? 'laboratorium'}. Presensi tidak dapat dibatalkan.`
            : 'Presensi tidak dapat dibatalkan.'
        }
        confirmLabel="Ya, Presensi"
        onCancel={() => setKonfirmasi(false)}
        onConfirm={() => {
          setKonfirmasi(false);
          void kirimPresensi();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 12 },
  back: { color: '#2563EB' },
  card: { gap: 4 },
  rowTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  judul: { fontSize: 16 },
  kecil: { fontSize: 13 },
  sukses: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC', gap: 2 },
  suksesJudul: { color: '#15803D', fontWeight: '700', fontSize: 16 },
  suksesTeks: { color: '#15803D' },
});
