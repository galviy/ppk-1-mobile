// Simpan di: src/app/praktikan/riwayat.tsx
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sesuaikan path import dengan struktur SRS-01 jika berbeda.
import { EmptyState, useApp } from '@/context/AppContext';
import { tanggalDariIso } from '@/lib/format';

type Baris = {
  sesiId: string;
  modul: string;
  kelas: string;
  tanggal: string;
  waktu: string;
};

export default function RiwayatScreen() {
  const { identitas, sesi, presensi } = useApp();

  // FR-4.6: hanya sesi yang pernah dihadiri praktikan aktif
  const data = useMemo<Baris[]>(() => {
    const hasil: Baris[] = [];
    for (const s of sesi) {
      const entri = (presensi[s.id] ?? []).find((p) => p.praktikanId === identitas.id);
      if (entri) {
        hasil.push({ sesiId: s.id, modul: s.modul, kelas: s.kelas, tanggal: s.tanggal, waktu: entri.waktu });
      }
    }
    // terbaru di atas
    return hasil.sort((a, b) => (a.tanggal === b.tanggal ? b.waktu.localeCompare(a.waktu) : b.tanggal.localeCompare(a.tanggal)));
  }, [sesi, presensi, identitas.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.sesiId}
        contentContainerStyle={[styles.list, data.length === 0 && styles.listKosong]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.judul}>Riwayat Kehadiran</Text>
            <Text style={styles.sub}>
              {identitas.nama} • Kelas {identitas.kelas} • {data.length} sesi dihadiri
            </Text>
          </View>
        }
        ListEmptyComponent={
          // FR-4.7
          <EmptyState title="Belum ada catatan kehadiran" message="Presensi yang kamu lakukan akan muncul di sini." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardAtas}>
              <Text style={styles.modul} numberOfLines={2}>
                {item.modul}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Hadir</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              Kelas {item.kelas} • {tanggalDariIso(item.tanggal)}
            </Text>
            <Text style={styles.waktu}>Waktu kehadiran: {item.waktu}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center', gap: 12 },
  listKosong: { flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 8 },
  judul: { fontSize: 22, fontWeight: '700', color: '#111827' },
  sub: { marginTop: 2, fontSize: 13, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  cardAtas: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  modul: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: '#166534', fontSize: 12, fontWeight: '600' },
  meta: { marginTop: 6, fontSize: 13, color: '#6B7280' },
  waktu: { marginTop: 2, fontSize: 14, color: '#374151', fontWeight: '500' },
});