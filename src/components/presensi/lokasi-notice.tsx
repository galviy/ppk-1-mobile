// Pesan kondisi perangkat untuk presensi (izin lokasi, GPS, lokasi belum ada).
// SEMENTARA: SRS-01 (P1) menyediakan <PermissionNotice jenis=... onRetry=... />; setelah PR P1 masuk,
// ganti pemakaian komponen ini dengan PermissionNotice lalu hapus berkas ini.
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type JenisLokasiNotice = 'izin' | 'izin-permanen' | 'gps' | 'belum-ada';

const ISI: Record<JenisLokasiNotice, { judul: string; teks: string; pengaturan: boolean }> = {
  izin: {
    judul: 'Izin lokasi diperlukan',
    teks: 'Presensi memeriksa lokasi Anda terhadap laboratorium. Izinkan akses lokasi lalu tekan Coba lagi.',
    pengaturan: false,
  },
  'izin-permanen': {
    judul: 'Izin lokasi ditolak',
    teks: 'Aktifkan izin Lokasi untuk aplikasi ini di Pengaturan, kembali ke aplikasi, lalu tekan Coba lagi.',
    pengaturan: true,
  },
  gps: {
    judul: 'Layanan lokasi (GPS) mati',
    teks: 'Aktifkan GPS/Lokasi di perangkat Anda, kembali ke aplikasi, lalu tekan Coba lagi.',
    pengaturan: true,
  },
  'belum-ada': {
    judul: 'Lokasi belum tersedia',
    teks: 'Pindah ke area terbuka dan tunggu beberapa detik, lalu tekan Coba lagi.',
    pengaturan: false,
  },
};

export function LokasiNotice({ jenis, onRetry }: { jenis: JenisLokasiNotice; onRetry: () => void }) {
  const isi = ISI[jenis];
  return (
    <View style={styles.box}>
      <ThemedText type="smallBold" style={styles.judul}>
        {isi.judul}
      </ThemedText>
      <ThemedText type="small" style={styles.teks}>
        {isi.teks}
      </ThemedText>
      <View style={styles.row}>
        <Pressable onPress={onRetry} accessibilityRole="button" style={[styles.btn, styles.btnUtama]}>
          <Text style={styles.btnUtamaText}>Coba lagi</Text>
        </Pressable>
        {isi.pengaturan ? (
          <Pressable
            onPress={() => void Linking.openSettings()}
            accessibilityRole="button"
            style={[styles.btn, styles.btnTepi]}>
            <Text style={styles.btnTepiText}>Buka Pengaturan</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  judul: { color: '#92400E' },
  teks: { color: '#92400E' },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnUtama: { backgroundColor: '#B45309' },
  btnUtamaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  btnTepi: { borderWidth: 1, borderColor: '#B45309' },
  btnTepiText: { color: '#B45309', fontWeight: '700', fontSize: 13 },
});
