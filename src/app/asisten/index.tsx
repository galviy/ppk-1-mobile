// Tab "Kelola Sesi": ringkasan seluruh sesi + aksi buka/tutup (FR-3.1 – FR-3.4)
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import SesiAksi from '@/components/SesiAksi';

export default function KelolaSesi() {
  const { sesi, presensi } = useApp();
  const router = useRouter();

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <Text style={s.heading}>Kelola Sesi</Text>
      <FlatList
        data={sesi}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <EmptyState title="Belum ada sesi" message="Jadwal sesi akan muncul di sini." />
        }
        renderItem={({ item }) => {
          const hadir = presensi.filter((p) => p.sesiId === item.id).length;
          return (
            <Card>
              <Pressable onPress={() => router.push(`/sesi/${item.id}`)} style={s.info}>
                <View style={s.rowTop}>
                  <Text style={s.title}>{item.modul}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={s.meta}>
                  {item.kelas} • {item.waktu}
                </Text>
                <Text style={s.meta}>{hadir} praktikan hadir</Text>
              </Pressable>
              <SesiAksi sesiId={item.id} />
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fa' },
  heading: { fontSize: 22, fontWeight: '700', color: '#1b1f23', paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  info: { gap: 4, marginBottom: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1b1f23' },
  meta: { fontSize: 13, color: '#57606a' },
});