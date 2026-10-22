// Simpan di: src/components/PresensiButton.tsx
import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/data/store';
import { jamDetik, jamMenit, tanggalPendek } from '@/lib/format';

// Definisikan tipe Sesi secara lokal agar tidak error meskipun store.tsx tidak mengekspornya
export type Sesi = {
  id: string;
  status: 'belum_dibuka' | 'dibuka' | 'ditutup';
  namaPraktikum?: string;
  modul?: string;
  kelas?: string;
  tanggal?: string;
};

type Step = 'konfirmasi' | 'sukses' | 'duplikat' | null;

export default function PresensiButton({ sesi }: { sesi: Sesi }) {
  const { identitas, presensi, tambahPresensi } = useApp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(null);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [waktuTercatat, setWaktuTercatat] = useState('');
  const sedangKirim = useRef(false);

  const infoModul = sesi.namaPraktikum ?? sesi.modul ?? 'Praktikum';

  const sudahPresensi = (presensi[sesi.id] ?? []).some((p) => p.praktikanId === identitas?.id);
  const entriSaya = (presensi[sesi.id] ?? []).find((p) => p.praktikanId === identitas?.id);
  const dibuka = sesi.status === 'dibuka';

  // FR-4.1 & FR-4.5
  let label = 'Presensi Sekarang';
  let keterangan: string | null = null;
  let aktif = dibuka && !sudahPresensi;

  if (sudahPresensi) {
    label = 'Sudah presensi';
    keterangan = entriSaya ? `Tercatat hadir pukul ${entriSaya.waktu}` : null;
  } else if (sesi.status === 'belum_dibuka') {
    keterangan = 'Sesi belum dibuka';
  } else if (sesi.status === 'ditutup') {
    keterangan = 'Sesi sudah ditutup';
  }

  const bukaKonfirmasi = () => {
    setWaktuSekarang(new Date());
    setStep('konfirmasi');
  };

  const kirim = () => {
    if (sedangKirim.current) return; // cegah double-tap
    sedangKirim.current = true;

    if (sudahPresensi) {
      setStep('duplikat');
      sedangKirim.current = false;
      return;
    }

    const waktu = jamDetik(new Date()); // FR-4.3
    const hasil = tambahPresensi(sesi.id, {
      praktikanId: identitas?.id ?? '',
      nama: identitas?.nama ?? '',
      kelas: (identitas?.kelas ?? 'A') as any, // Cast untuk mengatasi error tipe kelas "" vs union
      waktu,
    });

    if (hasil === false) {
      setStep('duplikat');
    } else {
      setWaktuTercatat(waktu);
      setStep('sukses');
    }
    sedangKirim.current = false;
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={bukaKonfirmasi}
        disabled={!aktif}
        accessibilityRole="button"
        accessibilityState={{ disabled: !aktif }}
        style={({ pressed }) => [
          styles.btn,
          sudahPresensi ? styles.btnSudah : aktif ? styles.btnAktif : styles.btnNonaktif,
          pressed && aktif && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.btnText, !aktif && !sudahPresensi && styles.btnTextNonaktif]}>
          {sudahPresensi ? '✓ ' : ''}
          {label}
        </Text>
      </Pressable>
      {keterangan ? <Text style={styles.ket}>{keterangan}</Text> : null}

      <Modal
        visible={step !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setStep(null)}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStep(null)} />
          <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.handle} />

            {step === 'konfirmasi' && (
              <>
                <Text style={styles.judul}>Konfirmasi Presensi</Text>
                <Text style={styles.nama}>
                  {identitas?.nama} - Kelas {identitas?.kelas}
                </Text>
                <Text style={styles.baris}>{infoModul}</Text>
                <Text style={styles.baris}>
                  Waktu: {tanggalPendek(waktuSekarang)}, {jamMenit(waktuSekarang)}
                </Text>
                <Text style={styles.tanya}>Presensi pada {jamMenit(waktuSekarang)}?</Text>
                <View style={styles.aksi}>
                  <Pressable style={[styles.aksiBtn, styles.batal]} onPress={() => setStep(null)}>
                    <Text style={styles.batalText}>Batal</Text>
                  </Pressable>
                  <Pressable style={[styles.aksiBtn, styles.kirim]} onPress={kirim}>
                    <Text style={styles.kirimText}>Kirim Presensi</Text>
                  </Pressable>
                </View>
              </>
            )}

            {step === 'sukses' && (
              <>
                <Text style={styles.centang}>✓</Text>
                <Text style={[styles.judul, { textAlign: 'center' }]}>
                  Presensi tercatat {waktuTercatat}
                </Text>
                <Text style={[styles.baris, { textAlign: 'center' }]}>{infoModul}</Text>
                <Pressable style={[styles.aksiBtn, styles.kirim, { marginTop: 16 }]} onPress={() => setStep(null)}>
                  <Text style={styles.kirimText}>Tutup</Text>
                </Pressable>
              </>
            )}

            {step === 'duplikat' && (
              <>
                <Text style={[styles.judul, { textAlign: 'center' }]}>Sudah presensi</Text>
                <Text style={[styles.baris, { textAlign: 'center' }]}>
                  Kamu sudah tercatat hadir pada sesi ini
                </Text>
                <Pressable style={[styles.aksiBtn, styles.kirim, { marginTop: 16 }]} onPress={() => setStep(null)}>
                  <Text style={styles.kirimText}>Tutup</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  btn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  btnAktif: { backgroundColor: '#2563EB' },
  btnNonaktif: { backgroundColor: '#E5E7EB' },
  btnSudah: { backgroundColor: '#16A34A' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnTextNonaktif: { color: '#6B7280' },
  ket: { marginTop: 8, textAlign: 'center', color: '#6B7280', fontSize: 13 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 16 },
  judul: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  nama: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  baris: { fontSize: 14, color: '#4B5563', marginBottom: 2 },
  tanya: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 12 },
  aksi: { flexDirection: 'row', gap: 12, marginTop: 16 },
  aksiBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  batal: { backgroundColor: '#F3F4F6' },
  batalText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  kirim: { backgroundColor: '#2563EB' },
  kirimText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  centang: { fontSize: 44, textAlign: 'center', color: '#16A34A', marginBottom: 4 },
});