// Tombol buka/tutup sesi + modal konfirmasi (FR-3.1 – FR-3.4).
// Dipakai di kartu tab Kelola (asisten/index.tsx) dan di slot tombol /sesi/[id] (SRS-02).
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '@/context/AppContext'; // sesuaikan path dengan SRS-01
import ConfirmModal from './ConfirmModal';

export default function SesiAksi({ sesiId }: { sesiId: string }) {
  const { sesi, presensi, setSesiStatus } = useApp();
  const [open, setOpen] = useState(false);

  const data = sesi.find((x) => x.id === sesiId);
  if (!data) return null;

  if (data.status === 'ditutup') {
    return (
      <Pressable disabled style={[s.btn, s.disabled]}>
        <Text style={s.disabledText}>Sesi sudah ditutup</Text>
      </Pressable>
    );
  }

  const akanBuka = data.status === 'belum_dibuka';
  const jumlahHadir = presensi.filter((p) => p.sesiId === sesiId).length;
  const label = `${data.modul} — ${data.kelas}`;

  const konfirmasi = () => {
    setSesiStatus(sesiId, akanBuka ? 'dibuka' : 'ditutup');
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={[s.btn, akanBuka ? s.buka : s.tutup]}
        onPress={() => setOpen(true)}
      >
        <Text style={s.btnText}>{akanBuka ? 'Buka sesi' : 'Tutup sesi'}</Text>
      </Pressable>

      <ConfirmModal
        visible={open}
        title={akanBuka ? `Yakin buka sesi ${label}?` : `Tutup sesi ${label}?`}
        message={
          akanBuka
            ? 'Praktikan bisa melakukan presensi setelah sesi dibuka.'
            : `Saat ini ${jumlahHadir} praktikan sudah hadir. Setelah ditutup, presensi tidak bisa dilakukan lagi.`
        }
        confirmLabel={akanBuka ? 'Ya, Buka' : 'Ya, Tutup'}
        onCancel={() => setOpen(false)}
        onConfirm={konfirmasi}
      />
    </>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buka: { backgroundColor: '#0f5c4d' },
  tutup: { backgroundColor: '#b42318' },
  btnText: { color: '#fff', fontWeight: '700' },
  disabled: { backgroundColor: '#eaeef2' },
  disabledText: { color: '#6e7781', fontWeight: '600' },
});