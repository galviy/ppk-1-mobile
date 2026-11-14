// Layar formulir pengajuan izin praktikan (SRS-03: FR-03.1 s.d. FR-03.10).
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LeaveRequestForm } from '@/components/izin/leave-request-form';
import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { InputIzin } from '@/data/izin-types';
import type { Profil } from '@/data/models';
import { useIzinSaya } from '@/hooks/use-izin';
import { useJadwalPraktikan, usePresensiSaya } from '@/hooks/use-praktikum';
import { ajukanIzin, pesanErrorIzin } from '@/services/izin';

export default function AjukanIzinScreen() {
  const { user, isLoading } = useAuth();
  if (!isLoading && !user) {
    return <Redirect href="/(auth)/login" />;
  }
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const params = useLocalSearchParams<{ sesiId?: string }>();
  const jadwal = useJadwalPraktikan(profil.uid);
  const sesiIds = useMemo(() => jadwal.sesi.map((s) => s.id), [jadwal.sesi]);
  const presensiSaya = usePresensiSaya(sesiIds, profil.uid);
  const izinSaya = useIzinSaya(profil.uid);

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeData>(null);
  const sedangKirimRef = useRef(false);

  const namaKelasMap = useMemo(
    () => Object.fromEntries(jadwal.kelas.map((k) => [k.id, k.nama])) as Record<string, string>,
    [jadwal.kelas],
  );
  const sudahPresensiIds = useMemo(
    () => new Set(Object.keys(presensiSaya.data)),
    [presensiSaya.data],
  );

  if (profil.role !== 'praktikan') {
    return <Redirect href="/asisten" />;
  }

  const handleSubmit = async (input: InputIzin) => {
    if (sedangKirimRef.current) return;
    sedangKirimRef.current = true;
    setSubmitting(true);
    setNotice(null);

    try {
      const hasil = await ajukanIzin(input, profil, izinSaya.sudahIzinIds);
      router.replace({
        pathname: '/izin/[id]',
        params: { id: hasil.id },
      });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanErrorIzin(e) });
    } finally {
      sedangKirimRef.current = false;
      setSubmitting(false);
    }
  };

  const error = jadwal.error ?? presensiSaya.error ?? izinSaya.error;
  const loading = jadwal.loading || presensiSaya.loading || izinSaya.loading;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()}>
        <ThemedText type="smallBold" style={styles.back}>
          ← Kembali
        </ThemedText>
      </Pressable>

      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.pageTitle}>
          Formulir Pengajuan Izin
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.small}>
          Pilih sesi praktikum yang tidak dapat diikuti dan tuliskan alasan ketidakhadiran Anda.
        </ThemedText>
      </View>

      <Notice data={notice ?? (error ? { tipe: 'err', teks: error } : null)} />

      {loading ? (
        <LoadingRow />
      ) : jadwal.kelas.length === 0 ? (
        <EmptyState
          title="Belum terdaftar di kelas"
          message="Asisten perlu menambahkan Anda sebagai peserta kelas sebelum dapat mengajukan izin."
        />
      ) : (
        <LeaveRequestForm
          sessions={jadwal.sesi}
          namaKelasMap={namaKelasMap}
          sudahPresensiIds={sudahPresensiIds}
          sudahIzinIds={izinSaya.sudahIzinIds}
          initialSesiId={params.sesiId ?? null}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 12,
  },
  back: { color: '#2563EB' },
  header: { gap: 4 },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
});
