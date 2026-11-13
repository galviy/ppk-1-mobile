// Tab "Kelas" (asisten): CRUD kelas; peserta dikelola di layar terpisah.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

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
import type { Kelas } from '@/data/models';
import { useKelasAsisten } from '@/hooks/use-praktikum';
import { cekKelas, pesanError } from '@/lib/validasi';
import { hapusKelas, tambahKelas, ubahKelas } from '@/services/praktikum';

type FormState = { id?: string; nama: string; keterangan: string };

export default function AsistenKelasScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const kelas = useKelasAsisten();
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hapus, setHapus] = useState<Kelas | null>(null);
  const [notice, setNotice] = useState<NoticeData>(null);

  const simpan = async () => {
    if (!form) return;
    const msg = cekKelas(form);
    if (msg) return setFormError(msg);
    setBusy(true);
    try {
      if (form.id) await ubahKelas(form.id, form);
      else await tambahKelas(form);
      setForm(null);
      setNotice({ tipe: 'ok', teks: form.id ? 'Kelas diperbarui.' : 'Kelas ditambahkan.' });
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
      await hapusKelas(target.id);
      setNotice({ tipe: 'ok', teks: 'Kelas dihapus.' });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.pageTitle}>Kelas Praktikum</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>Kelola kelas dan pesertanya</ThemedText>
        </View>
        <PrimaryButton
          label="+ Kelas"
          onPress={() => { setFormError(null); setForm({ nama: '', keterangan: '' }); }}
          style={styles.addBtn}
        />
      </View>

      <Notice data={notice ?? (kelas.error ? { tipe: 'err', teks: kelas.error } : null)} />

      {kelas.loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={kelas.data}
          keyExtractor={(k) => k.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="Belum ada kelas" message="Tekan + Kelas untuk membuat kelas pertama." />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <ThemedText type="smallBold" style={styles.cardTitle}>{item.nama}</ThemedText>
              {item.keterangan ? <ThemedText themeColor="textSecondary" style={styles.small}>{item.keterangan}</ThemedText> : null}
              <ThemedText themeColor="textSecondary" style={styles.small}>{item.pesertaUids.length} peserta</ThemedText>
              <PrimaryButton
                label="Kelola Peserta"
                onPress={() => router.push({ pathname: '/asisten/peserta/[kelasId]', params: { kelasId: item.id } })}
              />
              <View style={styles.row}>
                <PrimaryButton label="Ubah" variant="outline" style={styles.smallBtn}
                  onPress={() => { setFormError(null); setForm({ id: item.id, nama: item.nama, keterangan: item.keterangan }); }} />
                <PrimaryButton label="Hapus" variant="danger" style={styles.smallBtn} onPress={() => setHapus(item)} />
              </View>
            </Card>
          )}
        />
      )}

      <FormSheet
        visible={form !== null}
        title={form?.id ? 'Ubah Kelas' : 'Tambah Kelas'}
        error={formError}
        busy={busy}
        onCancel={() => setForm(null)}
        onSubmit={() => void simpan()}>
        <InputField label="Nama kelas" value={form?.nama ?? ''} placeholder="Kelas A"
          onChangeText={(v) => setForm((f) => (f ? { ...f, nama: v } : f))} />
        <InputField label="Keterangan (opsional)" value={form?.keterangan ?? ''}
          onChangeText={(v) => setForm((f) => (f ? { ...f, keterangan: v } : f))} />
      </FormSheet>

      <ConfirmModal
        visible={hapus !== null}
        title="Hapus kelas ini?"
        message={`${hapus?.nama ?? ''} dan daftar pesertanya akan dihapus. Kelas yang masih punya sesi tidak dapat dihapus.`}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  addBtn: { paddingVertical: 10 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 10 },
  cardTitle: { fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  smallBtn: { flex: 1, paddingVertical: 9 },
});
