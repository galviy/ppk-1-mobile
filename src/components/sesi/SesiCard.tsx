import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Sesi } from "@/data/types";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "2026-10-22" -> "22 Okt 2026" */
export function formatTanggal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function formatJam(s: Sesi) {
  return `${s.jamMulai}–${s.jamSelesai}`;
}

type Props = { sesi: Sesi; onPress: () => void };

export function SesiCard({ sesi, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <Text style={styles.title}>{sesi.namaPraktikum}</Text>
        <Text style={styles.meta}>
          Kelas {sesi.kelas} • {formatTanggal(sesi.tanggal)} • {formatJam(sesi)}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={sesi.status} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#666", marginTop: 4 },
  badgeRow: { flexDirection: "row", marginTop: 10 },
  pressed: { opacity: 0.7 },
});