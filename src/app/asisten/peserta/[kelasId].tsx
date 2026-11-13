// Peserta suatu kelas (asisten): lihat, tambah dari praktikan terdaftar, ubah, hapus.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { InputField } from '@/components/ui/input-field';
import { FormSheet } from '@/components/form-sheet';
import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import type { Peserta } from '@/data/models';
import { useKelasAsisten, usePeserta, usePraktikanTerdaftar } from '@/hooks/use-praktikum';
import { cekPeserta, pesanError } from '@/lib/validasi';
import { hapusPeserta, tambahPeserta, ubahPeserta } from '@/services/praktikum';

type FormState = { uid: string; nama: string; nim: string; baru: boolean };

export default function PesertaScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const { kelasId } = useLocalSearchParams<{ kelasId: string }>();
  const kelas = useKelasAsisten();
  const peserta = usePeserta(kelasId ?? null);
  const praktikan = usePraktikanTerdaftar();
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hapus, setHapus] = useState<Peserta | null>(null);
  const [notice, setNotice] = useState<NoticeData>(null);

  const namaKelas = kelas.data.find((k) => k.id === kelasId)?.nama ?? 'Kelas';
  const kandidat = useMemo(() => {
    const sudah = new Set(peserta.data.map((p) => p.uid));
    return praktikan.data.filter((p) => !sudah.has(p.uid));
  }, [peserta.data, praktikan.data]);

  const simpan = async () => {
    if (!form || !kelasId) return;
    const msg = form.uid ? cekPeserta(form) : 'Pilih praktikan terlebih dahulu.';
    if (msg) return setFormError(msg);
    setBusy(true);
    try {
      if (form.baru) await tambahPeserta(kelasId, form);
      else await ubahPeserta(kelasId, form.uid, form);
      setForm(null);
      setNotice({ tipe: 'ok', teks: form.baru ? 'Peserta ditambahkan.' : 'Peserta diperbarui.' });
    } catch (e) {
      setFormError(pesanError(e));
    } finally {
      setBusy(false);
    }
  };

  const konfirmasiHapus = async () => {
    if (!hapus || !kelasId) return;
    const target = hapus;
    setHapus(null);
    try {
      await hapusPeserta(kelasId, target.uid);
      setNotice({ tipe: 'ok', teks: 'Peserta dihapus dari kelas.' });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    }
  };

  return (
    <View style={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <ThemedText type="smallBold" style={styles.backText}>← Kembali</ThemedText>
      </Pressable>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.pageTitle}>Peserta {namaKelas}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>{peserta.data.length} peserta</ThemedText>
        </View>
        <PrimaryButton label="+ Peserta" style={styles.addBtn}
          onPress={() => { setFormError(null); setForm({ uid: '', nama: '', nim: '', baru: true }); }} />
      </View>

      <Notice data={notice ?? (peserta.error ? { tipe: 'err', teks: peserta.error } : null)} />

      {peserta.loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={peserta.data}
          keyExtractor={(p) => p.uid}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="Belum ada peserta" message="Tambahkan praktikan yang sudah terdaftar ke kelas ini." />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <ThemedText type="smallBold">{item.nama}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.small}>NIM {item.nim}</ThemedText>
              <View style={styles.row}>
                <PrimaryButton label="Ubah" variant="outline" style={styles.smallBtn}
                  onPress={() => { setFormError(null); setForm({ ...item, baru: false }); }} />
                <PrimaryButton label="Hapus" variant="danger" style={styles.smallBtn} onPress={() => setHapus(item)} />
              </View>
            </Card>
          )}
        />
      )}

      <FormSheet
        visible={form !== null}
        title={form?.baru ? 'Tambah Peserta' : 'Ubah Peserta'}
        error={formError}
        busy={busy}
        onCancel={() => setForm(null)}
        onSubmit={() => void simpan()}>
        {form?.baru ? (
          <View style={styles.kandidat}>
            <ThemedText type="small" themeColor="textSecondary">Pilih praktikan terdaftar</ThemedText>
            {praktikan.loading ? <LoadingRow /> : null}
            {!praktikan.loading && kandidat.length === 0 ? (
              <ThemedText type="small">Tidak ada praktikan baru. Praktikan harus registrasi akun terlebih dahulu.</ThemedText>
            ) : null}
            {kandidat.map((p) => {
              const aktif = form.uid === p.uid;
              return (
                <Pressable key={p.uid} onPress={() => setForm({ uid: p.uid, nama: p.nama, nim: p.nim ?? '', baru: true })}
                  style={[styles.opsi, aktif && styles.opsiAktif]}>
                  <ThemedText type="smallBold">{p.nama}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{p.nim || 'NIM belum diisi'}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <InputField label="Nama" value={form?.nama ?? ''} onChangeText={(v) => setForm((f) => (f ? { ...f, nama: v } : f))} />
        <InputField label="NIM" value={form?.nim ?? ''} autoCapitalize="characters"
          onChangeText={(v) => setForm((f) => (f ? { ...f, nim: v } : f))} />
      </FormSheet>

      <ConfirmModal
        visible={hapus !== null}
        title="Hapus peserta?"
        message={`${hapus?.nama ?? ''} akan dikeluarkan dari kelas ini dan tidak lagi melihat jadwalnya.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onCancel={() => setHapus(null)}
        onConfirm={() => void konfirmasiHapus()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  back: { paddingTop: Spacing.three },
  backText: { color: '#2563EB' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  addBtn: { paddingVertical: 10 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 6 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  smallBtn: { flex: 1, paddingVertical: 9 },
  kandidat: { gap: 8 },
  opsi: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10 },
  opsiAktif: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
});
