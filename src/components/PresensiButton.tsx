// Tombol presensi praktikan (Firestore). UI bottom sheet konfirmasi tetap dari SRS-04 Sprint 1;
// data kini lewat transaksi Firestore (anti presensi ganda) + listener real-time.
import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Sesi } from '@/data/models';
import { useAuth } from '@/context/AuthContext';
import { usePresensiSaya } from '@/hooks/use-praktikum';
import { jamDetik, jamMenit, tanggalPendek } from '@/lib/format';
import { DuplikatError, pesanError } from '@/lib/validasi';
import { catatPresensi } from '@/services/praktikum';

type Step = 'konfirmasi' | 'sukses' | 'duplikat' | 'gagal' | null;

export default function PresensiButton({ sesi }: { sesi: Sesi }) {
  const { user } = useAuth();
  const profil = user ? { uid: user.uid, nama: user.nama, nim: user.nim, role: user.role } : null;
  const insets = useSafeAreaInsets();
  const saya = usePresensiSaya([sesi.id], profil?.uid ?? null);

  const [step, setStep] = useState<Step>(null);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [waktuTercatat, setWaktuTercatat] = useState('');
  const [pesanGagal, setPesanGagal] = useState('');
  const sedangKirim = useRef(false);

  const infoModul = sesi.namaPraktikum;
  const entriSaya = saya.data[sesi.id];
  const sudahPresensi = !!entriSaya;
  const dibuka = sesi.status === 'dibuka';

  let label = 'Presensi Sekarang';
  let keterangan: string | null = saya.error;
  const aktif = dibuka && !sudahPresensi && !!profil && !saya.loading;

  if (sudahPresensi) {
    label = 'Sudah presensi';
    keterangan = `Tercatat hadir pukul ${jamDetik(entriSaya.waktu ?? new Date())}`;
  } else if (sesi.status === 'belum_dibuka') {
    keterangan = keterangan ?? 'Sesi belum dibuka';
  } else if (sesi.status === 'ditutup') {
    keterangan = keterangan ?? 'Sesi sudah ditutup';
  }

  const bukaKonfirmasi = () => {
    setWaktuSekarang(new Date());
    setStep('konfirmasi');
  };

  const kirim = async () => {
    if (sedangKirim.current || !profil) return; // cegah double-tap
    sedangKirim.current = true;
    try {
      await catatPresensi(sesi.id, profil);
      setWaktuTercatat(jamDetik(new Date()));
      setStep('sukses');
    } catch (e) {
      if (e instanceof DuplikatError) {
        setStep('duplikat');
      } else {
        setPesanGagal(pesanError(e));
        setStep('gagal');
      }
    } finally {
      sedangKirim.current = false;
    }
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
                  {profil?.nama}{profil?.nim ? ` • ${profil.nim}` : ''}
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
                  <Pressable style={[styles.aksiBtn, styles.kirim]} onPress={() => void kirim()}>
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

            {step === 'gagal' && (
              <>
                <Text style={[styles.judul, { textAlign: 'center' }]}>Presensi gagal</Text>
                <Text style={[styles.baris, { textAlign: 'center' }]}>{pesanGagal}</Text>
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