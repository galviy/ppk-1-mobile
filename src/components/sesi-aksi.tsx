// Tombol buka/tutup sesi + modal konfirmasi (SRS-03 FR-3.1 – FR-3.4).
// Dipakai di tab Kelola Sesi dan dapat dipasang di slot tombol /sesi/[id] (SRS-02):
//   <SesiAksi sesiId={id} />
import React, { useState } from 'react';

import { ConfirmModal } from '@/components/ui/confirm-modal';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useApp } from '@/data/store';

export function SesiAksi({ sesiId }: { sesiId: string }) {
  const { daftarSesi, presensi, setSesiStatus } = useApp();
  const [visible, setVisible] = useState(false);

  const sesi = daftarSesi.find((s) => s.id === sesiId);
  if (!sesi) return null;

  if (sesi.status === 'ditutup') {
    return <PrimaryButton label="Sesi sudah ditutup" onPress={() => {}} disabled />;
  }

  const akanBuka = sesi.status === 'belum_dibuka';
  const nama = `${sesi.namaPraktikum} — Kelas ${sesi.kelas}`;
  const jumlahHadir = presensi[sesiId]?.length ?? 0;

  const konfirmasi = () => {
    setSesiStatus(sesiId, akanBuka ? 'dibuka' : 'ditutup');
    setVisible(false);
  };

  return (
    <>
      <PrimaryButton
        label={akanBuka ? 'Buka Sesi' : 'Tutup Sesi'}
        variant={akanBuka ? 'primary' : 'danger'}
        onPress={() => setVisible(true)}
      />
      <ConfirmModal
        visible={visible}
        title={akanBuka ? `Yakin buka sesi ${nama}?` : `Tutup sesi ${nama}?`}
        message={
          akanBuka
            ? 'Praktikan dapat melakukan presensi setelah sesi dibuka.'
            : `Saat ini ${jumlahHadir} praktikan sudah hadir. Setelah ditutup, presensi tidak dapat dilakukan lagi.`
        }
        confirmLabel={akanBuka ? 'Ya, Buka' : 'Ya, Tutup'}
        variant={akanBuka ? 'primary' : 'danger'}
        onCancel={() => setVisible(false)}
        onConfirm={konfirmasi}
      />
    </>
  );
}
