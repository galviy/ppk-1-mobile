import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { useApp } from "@/data/store";
import { EmptyState } from "@/components/ui/empty-state";
import { SesiCard } from "@/components/sesi/SesiCard";

type FilterKelas = "Semua" | "A" | "B";
const FILTERS: FilterKelas[] = ["Semua", "A", "B"];

export default function DaftarJadwal() {
  const { role, identitas, daftarSesi, daftarPraktikan } = useApp();
  const [filter, setFilter] = useState<FilterKelas>("Semua");

  // NOTE: kontrak SRS-01 `identitas` cuma {id, nama}. Kelas praktikan dibaca dari
  // identitas.kelas kalau P1 menambahkannya (lihat catatan koordinasi).
  const kelasPraktikan =
  identitas?.kelas ?? daftarPraktikan.find((p) => p.id === identitas?.id)?.kelas;

  const data = useMemo(() => {
    let list = [...daftarSesi];
    if (role === "praktikan") {
      if (kelasPraktikan) list = list.filter((s) => s.kelas === kelasPraktikan);
    } else if (filter !== "Semua") {
      list = list.filter((s) => s.kelas === filter);
    }
    return list.sort((a, b) =>
      `${a.tanggal} ${a.jamMulai}`.localeCompare(`${b.tanggal} ${b.jamMulai}`)
    );
  }, [daftarSesi, role, filter, kelasPraktikan]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Jadwal Praktikum" }} />

      {role === "asisten" && (
        <View style={styles.chips}>
          {FILTERS.map((f) => {
            const aktif = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.chip, aktif && styles.chipAktif]}
              >
                <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>
                  {f === "Semua" ? "Semua" : `Kelas ${f}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={data.length === 0 ? styles.emptyWrap : styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <SesiCard
            sesi={item}
            onPress={() => router.push({ pathname: "/sesi/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState title="Belum ada jadwal" message="Jadwal praktikum akan muncul di sini." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipAktif: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextAktif: { color: "#fff", fontWeight: "600" },
  list: { padding: 16 },
  emptyWrap: { flexGrow: 1, justifyContent: "center", padding: 16 },
});