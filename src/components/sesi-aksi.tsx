// Buka/tutup sesi (FR-02.9) dengan modal konfirmasi. Dipakai di tab Sesi asisten.
import React, { useState } from 'react';

import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Sesi } from '@/data/models';
import { pesanError } from '@/lib/validasi';
import { setStatusSesi } from '@/services/praktikum';

type Props = {
  sesi: Sesi;
  namaKelas: string;
  jumlahHadir?: number;
  onResult: (tipe: 'ok' | 'err', teks: string) => void;
};

export function SesiAksi({ sesi, namaKelas, jumlahHadir, onResult }: Props) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sesi.status === 'ditutup') {
    return <PrimaryButton label="Sesi sudah ditutup" onPress={() => {}} disabled />;
  }

  const akanBuka = sesi.status === 'belum_dibuka';
  const nama = `${sesi.namaPraktikum} — ${namaKelas}`;

  const konfirmasi = async () => {
    setVisible(false);
    setBusy(true);
    try {
      await setStatusSesi(sesi.id, akanBuka ? 'dibuka' : 'ditutup');
      onResult('ok', akanBuka ? 'Sesi berhasil dibuka.' : 'Sesi berhasil ditutup.');
    } catch (e) {
      onResult('err', pesanError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PrimaryButton
        label={busy ? 'Memproses…' : akanBuka ? 'Buka Sesi' : 'Tutup Sesi'}
        variant={akanBuka ? 'primary' : 'danger'}
        disabled={busy}
        onPress={() => setVisible(true)}
      />
      <ConfirmModal
        visible={visible}
        title={akanBuka ? `Yakin buka sesi ${nama}?` : `Tutup sesi ${nama}?`}
        message={
          akanBuka
            ? 'Praktikan dapat melakukan presensi setelah sesi dibuka.'
            : `${jumlahHadir ?? 0} praktikan sudah hadir. Setelah ditutup, presensi tidak dapat dilakukan lagi.`
        }
        confirmLabel={akanBuka ? 'Ya, Buka' : 'Ya, Tutup'}
        variant={akanBuka ? 'primary' : 'danger'}
        onCancel={() => setVisible(false)}
        onConfirm={() => void konfirmasi()}
      />
    </>
  );
}
