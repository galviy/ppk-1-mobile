// Tab "Rekap": pilih sesi → daftar praktikan hadir (FR-3.5 – FR-3.8)
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';

// "2026-10-22T13:02:11" -> "13:02:11". Jika bukan ISO, tampilkan apa adanya.
function formatJam(waktu: string) {
  const d = new Date(waktu);
  if (isNaN(d.getTime())) return waktu;
  return d.toLocaleTimeString('id-ID', { hour12: false }).replace(/\./g, ':');
}

export default function Rekap() {
  const { sesi, presensi } = useApp();
  const [sesiId, setSesiId] = useState<string | undefined>(sesi[0]?.id);

  // jaga agar ada sesi terpilih bila daftar sesi baru terisi
  useEffect(() => {
    if (!sesiId && sesi.length) setSesiId(sesi[0].id);
  }, [sesi, sesiId]);

  const terpilih = sesi.find((x) => x.id === sesiId);

  // terkini di atas (terurut waktu)
  const hadir = useMemo(
    () =>
      presensi
        .filter((p) => p.sesiId === sesiId)
        .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime()),
    [presensi, sesiId],
  );

  const totalLabel = terpilih?.jumlahPraktikan
    ? `${hadir.length}/${terpilih.jumlahPraktikan} praktikan`
    : `${hadir.length} praktikan hadir`;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <Text style={s.heading}>Rekap Presensi</Text>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {sesi.map((x) => {
            const aktif = x.id === sesiId;
            return (
              <Pressable
                key={x.id}
                onPress={() => setSesiId(x.id)}
                style={[s.chip, aktif && s.chipAktif]}
              >
                <Text style={[s.chipText, aktif && s.chipTextAktif]}>
                  {x.modul} • {x.kelas}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {!terpilih ? (
        <EmptyState title="Belum ada sesi" message="Pilih sesi untuk melihat rekap." />
      ) : (
        <FlatList
          data={hadir}
          keyExtractor={(p) => p.id}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <View style={s.header}>
              <Text style={s.headerTitle}>
                {terpilih.modul} • {terpilih.kelas}
              </Text>
              <Card>
                <Text style={s.summaryLabel}>Total hadir</Text>
                <Text style={s.summaryValue}>{totalLabel}</Text>
              </Card>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="Belum ada yang hadir"
              message="Praktikan yang sudah presensi akan muncul di sini."
            />
          }
          renderItem={({ item }) => (
            <Card>
              <Text style={s.nama}>
                {item.nim} • {item.nama}
              </Text>
              <Text style={s.meta}>
                {item.kelas} • masuk {formatJam(item.waktu)}
              </Text>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fa' },
  heading: { fontSize: 22, fontWeight: '700', color: '#1b1f23', paddingHorizontal: 16, paddingTop: 8 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#d0d7de', backgroundColor: '#fff' },
  chipAktif: { backgroundColor: '#0f5c4d', borderColor: '#0f5c4d' },
  chipText: { fontSize: 13, color: '#1b1f23' },
  chipTextAktif: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 },
  header: { gap: 10, marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1b1f23' },
  summaryLabel: { fontSize: 13, color: '#57606a' },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#0f5c4d', marginTop: 2 },
  nama: { fontSize: 15, fontWeight: '600', color: '#1b1f23' },
  meta: { fontSize: 13, color: '#57606a', marginTop: 2 },
});