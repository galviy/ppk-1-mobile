import { StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useApp } from "@/data/store";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { formatJam, formatTanggal } from "@/components/sesi/SesiCard";

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof children === "string" ? <Text style={styles.value}>{children}</Text> : children}
    </View>
  );
}

export default function DetailSesi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role, daftarSesi } = useApp();

  // Selalu baca dari state global -> status otomatis ikut berubah (FR-2.4)
  const sesi = daftarSesi.find((s) => s.id === id);

  if (!sesi) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: "Detail Sesi" }} />
        <EmptyState title="Sesi tidak ditemukan" message="Sesi ini mungkin sudah tidak tersedia." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: sesi.namaPraktikum }} />

      <Card>
        <Baris label="Praktikum">{sesi.namaPraktikum}</Baris>
        <Baris label="Kelas">{`Kelas ${sesi.kelas}`}</Baris>
        <Baris label="Tanggal">{formatTanggal(sesi.tanggal)}</Baris>
        <Baris label="Jam">{formatJam(sesi)}</Baris>
        <Baris label="Status">
          <StatusBadge status={sesi.status} />
        </Baris>
      </Card>

      {/* ===== SLOT FR-2.5 ===== */}
      <View style={styles.slot}>
        {role === "asisten" ? (
          // TODO(SRS-03 / P3): ganti dengan tombol buka/tutup sesi + modal konfirmasi
          <PrimaryButton label="Kontrol sesi (SRS-03)" onPress={() => {}} disabled />
        ) : (
          // TODO(SRS-04 / P4): ganti dengan tombol presensi + bottom sheet
          <PrimaryButton label="Presensi (SRS-04)" onPress={() => {}} disabled />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: "center", padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "500", flexShrink: 1, textAlign: "right", marginLeft: 16 },
  slot: { marginTop: "auto" },
});