// Pintu masuk presensi: seluruh pemeriksaan lokasi dan pencatatan dilakukan di halaman khusus.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import type { Sesi } from '@/data/models';
import { useAuth } from '@/context/AuthContext';
import { usePresensiSaya } from '@/hooks/use-praktikum';
import { jamDetik } from '@/lib/format';

export default function PresensiButton({ sesi }: { sesi: Sesi }) {
  const { user } = useAuth();
  const saya = usePresensiSaya([sesi.id], user?.uid ?? null);
  const entri = saya.data[sesi.id];
  const sudahPresensi = !!entri;

  let keterangan: string | null = saya.error;
  if (sudahPresensi) {
    keterangan = `Tercatat hadir pukul ${jamDetik(entri.waktu ?? new Date())}`;
  } else if (sesi.status === 'belum_dibuka') {
    keterangan = 'Sesi belum dibuka.';
  } else if (sesi.status === 'ditutup') {
    keterangan = 'Sesi sudah ditutup.';
  }

  const bukaHalamanPresensi = () => {
    router.push({
      pathname: '/presensi/[sesiId]',
      params: { sesiId: sesi.id },
    });
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={bukaHalamanPresensi}
        disabled={!user}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.btn,
          sudahPresensi ? styles.btnSudah : styles.btnAktif,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.btnText}>
          {sudahPresensi ? '✓ Sudah presensi — Lihat' : 'Buka Halaman Presensi'}
        </Text>
      </Pressable>
      {keterangan ? <Text style={styles.ket}>{keterangan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  btn: { paddingVertical: 13, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  btnAktif: { backgroundColor: '#2563EB' },
  btnSudah: { backgroundColor: '#16A34A' },
  pressed: { opacity: 0.82 },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  ket: { color: '#64748B', fontSize: 12, textAlign: 'center' },
});