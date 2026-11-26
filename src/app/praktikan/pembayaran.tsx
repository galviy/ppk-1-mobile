// Daftar tagihan denda & riwayat pembayaran praktikan (FR-S4-04.6, 04.9).
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice } from '@/components/notice';
import { TagihanCard, rupiah } from '@/components/pembayaran/tagihan-card';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import type { Profil } from '@/data/models';
import { useTagihanSaya, useTransaksiSaya } from '@/hooks/use-pembayaran';
import { jamMenit, tanggalPendek } from '@/lib/format';
import type { Transaksi } from '@/services/pembayaran';

export default function PraktikanPembayaranScreen() {
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const tagihan = useTagihanSaya(profil.uid);
  const transaksi = useTransaksiSaya(profil.uid);

  const belumLunas = tagihan.data.filter((t) => t.statusPembayaran !== 'success');
  const lunas = tagihan.data.filter((t) => t.statusPembayaran === 'success');
  const totalTunggakan = belumLunas.reduce((jumlah, t) => jumlah + t.nominal, 0);
  const error = tagihan.error ?? transaksi.error;
  const loading = tagihan.loading || transaksi.loading;

  const bukaTagihan = (id: string) =>
    router.push(`/pembayaran/${id}` as Href);

  return (
    <View style={styles.content}>
      <View style={styles.title}>
        <ThemedText type="subtitle" style={styles.pageTitle}>Tagihan Denda</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.small}>
          {belumLunas.length} tagihan belum lunas
        </ThemedText>
      </View>

      <Notice
        data={error ? { tipe: 'err', teks: error } : null}
        onRetry={() => {
          tagihan.retry();
          transaksi.retry();
        }}
      />

      {loading ? (
        <LoadingRow />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Card style={styles.ringkasan}>
            <ThemedText themeColor="textSecondary" style={styles.small}>
              Total tunggakan
            </ThemedText>
            <ThemedText type="subtitle" style={styles.total}>
              {rupiah(totalTunggakan)}
            </ThemedText>
          </Card>

          <ThemedText type="smallBold" style={styles.section}>
            Belum Lunas
          </ThemedText>
          {belumLunas.length === 0 ? (
            <EmptyState
              title="Tidak ada tunggakan"
              message="Semua tagihan denda Anda sudah lunas."
            />
          ) : (
            belumLunas.map((item) => (
              <TagihanCard key={item.id} tagihan={item} onPress={() => bukaTagihan(item.id)} />
            ))
          )}

          {lunas.length > 0 ? (
            <>
              <ThemedText type="smallBold" style={styles.section}>
                Lunas
              </ThemedText>
              {lunas.map((item) => (
                <TagihanCard key={item.id} tagihan={item} onPress={() => bukaTagihan(item.id)} />
              ))}
            </>
          ) : null}

          <ThemedText type="smallBold" style={styles.section}>
            Riwayat Pembayaran
          </ThemedText>
          {transaksi.data.length === 0 ? (
            <EmptyState
              title="Belum ada pembayaran"
              message="Transaksi Midtrans Anda akan tampil di sini."
            />
          ) : (
            transaksi.data.map((item) => <TransaksiCard key={item.orderId} transaksi={item} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

function TransaksiCard({ transaksi }: { transaksi: Transaksi }) {
  const waktu = transaksi.dibuatPada
    ? `${tanggalPendek(transaksi.dibuatPada)} ${jamMenit(transaksi.dibuatPada)}`
    : '…';
  const label = transaksi.status === 'success' ? 'Berhasil' : transaksi.status === 'pending' ? 'Menunggu' : 'Gagal';
  return (
    <Card style={styles.transaksi}>
      <View style={styles.transaksiRow}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.orderId}>
          {transaksi.orderId}
        </ThemedText>
        <ThemedText type="smallBold">{rupiah(transaksi.nominal)}</ThemedText>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.small}>
        {label}
        {transaksi.paymentType ? ` • ${transaksi.paymentType}` : ''} • {waktu}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: Spacing.four },
  title: { paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  list: { paddingBottom: Spacing.six, gap: 4 },
  ringkasan: { gap: 2, marginBottom: Spacing.two },
  total: { fontSize: 26, lineHeight: 32 },
  section: { marginTop: Spacing.three, marginBottom: Spacing.one },
  transaksi: { gap: 2 },
  transaksiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  orderId: { flex: 1, fontSize: 13 },
});
