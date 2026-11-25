import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { FormSheet } from '@/components/form-sheet';
import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import type { FormLab, Laboratorium } from '@/data/lab-types';
import { useLaboratoriumList } from '@/hooks/use-laboratorium';
import { pesanError } from '@/lib/validasi';
import { parseInputLab } from '@/lib/validasi-lab';
import { hapusLab, tambahLab, ubahLab } from '@/services/laboratorium';
import { PermissionNotice } from '@/components/device/PermissionNotice';
import { useCurrentLocation } from '@/hooks/use-location';

type FormState = FormLab & { id?: string };

const FORM_KOSONG: FormState = {
  nama: '',
  kode: '',
  deskripsi: '',
  latitude: '',
  longitude: '',
  radiusMeter: '100'
};

export default function AsistenLaboratoriumScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const labs = useLaboratoriumList();
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hapus, setHapus] = useState<Laboratorium | null>(null);
  const [notice, setNotice] = useState<NoticeData>(null);
  const [ambilLokasi, setAmbilLokasi] = useState(false);

  const isiKoordinat = useCallback((latitude: number, longitude: number) => {
    setForm((f) =>
      f
        ? {
            ...f,
            latitude: String(latitude),
            longitude: String(longitude),
          }
        : f,
    );

    setAmbilLokasi(false);
    setFormError(null);
  }, []);

  const set = (k: keyof FormLab) => (v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const simpan = async () => {
    if (!form) return;
    const { input, error } = parseInputLab(form);
    if (error) return setFormError(error);
    setBusy(true);
    try {
      if (form.id) await ubahLab(form.id, input);
      else await tambahLab(input);
      setForm(null);
      setNotice({ tipe: 'ok', teks: form.id ? 'Laboratorium diperbarui.' : 'Laboratorium ditambahkan.' });
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
      await hapusLab(target.id);
      setNotice({ tipe: 'ok', teks: 'Laboratorium dihapus.' });
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    }
  };

  const bukaForm = (lab?: Laboratorium) => {
    setFormError(null);
    setForm(
      lab
        ? {
            id: lab.id,
            nama: lab.nama,
            kode: lab.kode,
            deskripsi: lab.deskripsi,
            latitude: String(lab.latitude),
            longitude: String(lab.longitude),
            radiusMeter: String(lab.radiusMeter),
          }
        : FORM_KOSONG,
    );
  };

  return (
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.pageTitle}>Kelola Laboratorium</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>
            Lokasi dan radius dipakai untuk validasi presensi
          </ThemedText>
        </View>
        <PrimaryButton label="+ Lab" onPress={() => bukaForm()} style={styles.addBtn} />
      </View>

      <Notice data={notice ?? (labs.error ? { tipe: 'err', teks: labs.error } : null)} />
      {labs.error && !notice ? (
        <PrimaryButton label="Coba lagi" variant="outline" onPress={labs.retry} />
      ) : null}

      {labs.loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={labs.data}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState title="Belum ada laboratorium" message="Tekan + Lab untuk menambahkan laboratorium pertama." />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <ThemedText type="smallBold" style={styles.cardTitle}>{item.nama} ({item.kode})</ThemedText>
              {item.deskripsi ? (
                <ThemedText themeColor="textSecondary" style={styles.small}>{item.deskripsi}</ThemedText>
              ) : null}
              <ThemedText themeColor="textSecondary" style={styles.small}>
                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)} · radius {item.radiusMeter} m
              </ThemedText>
              <View style={styles.row}>
                <PrimaryButton label="Ubah" variant="outline" style={styles.smallBtn} onPress={() => bukaForm(item)} />
                <PrimaryButton label="Hapus" variant="danger" style={styles.smallBtn} onPress={() => setHapus(item)} />
              </View>
            </Card>
          )}
        />
      )}

      <FormSheet
        visible={form !== null}
        title={form?.id ? 'Ubah Laboratorium' : 'Tambah Laboratorium'}
        error={formError}
        busy={busy}
        onCancel={() => setForm(null)}
        onSubmit={() => void simpan()}>
        <InputField label="Nama" value={form?.nama ?? ''} placeholder="Lab Rekayasa Perangkat Lunak" onChangeText={set('nama')} />
        <InputField label="Kode" value={form?.kode ?? ''} placeholder="LAB-RPL" autoCapitalize="characters" onChangeText={set('kode')} />
        <InputField
          label="Deskripsi (opsional)"
          value={form?.deskripsi ?? ''}
          onChangeText={set('deskripsi')}
        />

        <PrimaryButton
          label="Gunakan lokasi saya"
          variant="outline"
          onPress={() => setAmbilLokasi(true)}
          style={styles.locationBtn}
        />

        {ambilLokasi && (
          <AmbilLokasiLab
            onLokasi={isiKoordinat}
            onTutup={() => setAmbilLokasi(false)}
          />
        )}

        <InputField
          label="Latitude"
          value={form?.latitude ?? ''}
          placeholder="-7.049"
          keyboardType="numeric"
          helperText="-90 s.d. 90"
          onChangeText={set('latitude')}
        />
        <InputField label="Longitude" value={form?.longitude ?? ''} placeholder="110.438" keyboardType="numeric"
          helperText="-180 s.d. 180" onChangeText={set('longitude')} />
        <InputField
          label="Radius presensi (meter)"
          value={form?.radiusMeter ?? ''}
          placeholder="100"
          keyboardType="numeric"
          helperText="10 s.d. 500 meter"
          onChangeText={set('radiusMeter')}
        />
      </FormSheet>

      <ConfirmModal
        visible={hapus !== null}
        title="Hapus laboratorium ini?"
        message={`${hapus?.nama ?? ''} akan dihapus. Laboratorium yang masih dipakai sesi tidak dapat dihapus.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onCancel={() => setHapus(null)}
        onConfirm={() => void konfirmasiHapus()}
      />
    </View>
  );
}

type AmbilLokasiLabProps = {
  onLokasi: (latitude: number, longitude: number) => void;
  onTutup: () => void;
};

function AmbilLokasiLab({
  onLokasi,
  onTutup,
}: AmbilLokasiLabProps) {
  const {
    lokasi,
    statusIzin,
    gpsAktif,
    loading,
    error,
    refresh,
  } = useCurrentLocation();

  useEffect(() => {
    if (lokasi && !lokasi.mocked) {
      onLokasi(lokasi.latitude, lokasi.longitude);
    }
  }, [lokasi, onLokasi]);

  if (statusIzin === 'ditolak' || statusIzin === 'ditolak-permanen') {
    return (
      <PermissionNotice
        jenis="lokasi"
        onRetry={refresh}
      />
    );
  }

  if (gpsAktif === false) {
    return (
      <PermissionNotice
        jenis="gps"
        onRetry={refresh}
      />
    );
  }

  if (lokasi?.mocked) {
    return (
      <PermissionNotice
        jenis="lokasi-belum-ada"
        judul="Lokasi Tidak Dapat Digunakan"
        pesan="Perangkat mendeteksi lokasi simulasi. Gunakan lokasi perangkat yang sebenarnya."
        onRetry={refresh}
      />
    );
  }

  if (error) {
    return (
      <PermissionNotice
        jenis="lokasi-belum-ada"
        onRetry={refresh}
      />
    );
  }

  if (loading || !lokasi) {
    return <LoadingRow />;
  }

  return null;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  addBtn: { paddingVertical: 10 },
  locationBtn: { alignSelf: 'flex-start' },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 8 },
  cardTitle: { fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  smallBtn: { flex: 1, paddingVertical: 9 },
});