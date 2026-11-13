// Tab "Jadwal & Sesi" (asisten): CRUD jadwal/sesi + buka/tutup, real-time dari Firestore.
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { InputField } from '@/components/ui/input-field';
import { FormSheet } from '@/components/form-sheet';
import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { SesiAksi } from '@/components/sesi-aksi';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import type { InputSesi, Sesi } from '@/data/models';
import { useKelasAsisten, useSesiAsisten } from '@/hooks/use-praktikum';
import { cekSesi, pesanError } from '@/lib/validasi';
import { hapusSesi, tambahSesi, ubahSesi } from '@/services/praktikum';

type FormState = InputSesi & { id?: string };
const hariIni = () => new Date().toISOString().slice(0, 10);
const formKosong = (kelasId = ''): FormState => ({
  kelasId, namaPraktikum: '', tanggal: hariIni(), jamMulai: '13:00', jamSelesai: '15:00', ruang: '',
});

export default function AsistenSesiScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const kelas = useKelasAsisten();
  const sesi = useSesiAsisten();
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hapus, setHapus] = useState<Sesi | null>(null);
  const [notice, setNotice] = useState<NoticeData>(null);

  const namaKelas = useMemo(
    () => Object.fromEntries(kelas.data.map((k) => [k.id, k.nama])) as Record<string, string>,
    [kelas.data],
  );

  const bukaForm = (f: FormState) => {
    setFormError(null);
    setForm(f);
  };

  const simpan = async () => {
    if (!form) return;
    const msg = cekSesi(form);
    if (msg) return setFormError(msg);
    setBusy(true);
    try {
      if (form.id) await ubahSesi(form.id, form);
      else await tambahSesi(form);
      setForm(null);
      setNotice({ tipe: 'ok', teks: form.id ? 'Sesi diperbarui.' : 'Sesi ditambahkan.' });
    } catch (e) {
      setFormError(pesanError(e));
    } finally {
      setBusy(false);
    }
  };

  const konfirmasiHapus = async () => {
    if (!hapus) return;
    const target = hapus;
    setHapus(null);
    try {
      await hapusSesi(target.id);
      setNotice({ tipe: 'ok', teks: 'Sesi dihapus.' });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    }
  };

  const set = (k: keyof FormState) => (v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const error = kelas.error ?? sesi.error;

  return (
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.pageTitle}>Jadwal & Sesi</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>Tambah, ubah, hapus, buka, dan tutup sesi</ThemedText>
        </View>
        <PrimaryButton
          label="+ Sesi"
          disabled={kelas.data.length === 0}
          onPress={() => bukaForm(formKosong(kelas.data[0]?.id))}
          style={styles.addBtn}
        />
      </View>

      <Notice data={notice ?? (error ? { tipe: 'err', teks: error } : null)} />

      {sesi.loading || kelas.loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={sesi.data}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            kelas.data.length === 0 ? (
              <EmptyState title="Belum ada kelas" message="Buat kelas di tab Kelas sebelum menambahkan sesi." />
            ) : (
              <EmptyState title="Belum ada sesi" message="Tekan + Sesi untuk menambahkan jadwal praktikum." />
            )
          }
          renderItem={({ item }) => (
            <KartuSesi
              sesi={item}
              namaKelas={namaKelas[item.kelasId] ?? 'Kelas dihapus'}
              onEdit={() => bukaForm({ ...item })}
              onHapus={() => setHapus(item)}
              onResult={(tipe, teks) => setNotice({ tipe, teks })}
            />
          )}
        />
      )}

      <FormSheet
        visible={form !== null}
        title={form?.id ? 'Ubah Sesi' : 'Tambah Sesi'}
        error={formError}
        busy={busy}
        onCancel={() => setForm(null)}
        onSubmit={() => void simpan()}>
        <ThemedText type="small" themeColor="textSecondary">Kelas</ThemedText>
        <View style={styles.chips}>
          {kelas.data.map((k) => {
            const aktif = form?.kelasId === k.id;
            return (
              <Pressable key={k.id} onPress={() => set('kelasId')(k.id)} style={[styles.chip, aktif && styles.chipActive]}>
                <Text style={[styles.chipText, aktif && styles.chipTextActive]}>{k.nama}</Text>
              </Pressable>
            );
          })}
        </View>
        <InputField label="Nama praktikum" value={form?.namaPraktikum ?? ''} onChangeText={set('namaPraktikum')} placeholder="Modul 1 — Siklus Hidup" />
        <InputField label="Tanggal (YYYY-MM-DD)" value={form?.tanggal ?? ''} onChangeText={set('tanggal')} autoCapitalize="none" />
        <View style={styles.row}>
          <View style={styles.flex}><InputField label="Jam mulai" value={form?.jamMulai ?? ''} onChangeText={set('jamMulai')} placeholder="13:00" /></View>
          <View style={styles.flex}><InputField label="Jam selesai" value={form?.jamSelesai ?? ''} onChangeText={set('jamSelesai')} placeholder="15:00" /></View>
        </View>
        <InputField label="Ruang (opsional)" value={form?.ruang ?? ''} onChangeText={set('ruang')} />
      </FormSheet>

      <ConfirmModal
        visible={hapus !== null}
        title="Hapus sesi ini?"
        message={`${hapus?.namaPraktikum ?? ''} beserta seluruh data presensinya akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onCancel={() => setHapus(null)}
        onConfirm={() => void konfirmasiHapus()}
      />
    </View>
  );
}

function KartuSesi({
  sesi, namaKelas, onEdit, onHapus, onResult,
}: {
  sesi: Sesi; namaKelas: string; onEdit: () => void; onHapus: () => void;
  onResult: (tipe: 'ok' | 'err', teks: string) => void;
}) {
  return (
    <Card style={styles.card}>
      <Pressable
        onPress={() => router.push({ pathname: '/sesi/[id]', params: { id: sesi.id } })}
        style={styles.cardTop}>
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={styles.cardTitle}>{sesi.namaPraktikum}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>{namaKelas} • {sesi.tanggal}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>
            {sesi.jamMulai} - {sesi.jamSelesai} WIB{sesi.ruang ? ` • ${sesi.ruang}` : ''}
          </ThemedText>
        </View>
        <StatusBadge status={sesi.status} />
      </Pressable>

      <SesiAksi sesi={sesi} namaKelas={namaKelas} onResult={onResult} />

      <View style={styles.row}>
        <PrimaryButton label="Ubah" variant="outline" onPress={onEdit} style={styles.smallBtn} />
        <PrimaryButton label="Hapus" variant="danger" onPress={onHapus} style={styles.smallBtn} />
        <PrimaryButton
          label="Rekap"
          variant="secondary"
          onPress={() => router.navigate({ pathname: '/asisten/rekap', params: { sesiId: sesi.id } })}
          style={styles.smallBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  addBtn: { paddingVertical: 10 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 12 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  smallBtn: { flex: 1, paddingVertical: 9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
});
