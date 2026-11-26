// Checkout tagihan denda: buka Midtrans Snap, lalu sinkronkan status (FR-S4-04.7, 04.8, 04.10).
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import { StatusPembayaranBadge } from '@/components/pembayaran/status-pembayaran-badge';
import { rupiah } from '@/components/pembayaran/tagihan-card';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import type { Profil } from '@/data/models';
import { useTagihanDetail, useTransaksiTagihan } from '@/hooks/use-pembayaran';
import { jamMenit, tanggalDariIso, tanggalPendek } from '@/lib/format';
import { pesanError } from '@/lib/validasi';
import { buatPembayaran, cekStatusPembayaran, type Transaksi } from '@/services/pembayaran';

export default function PembayaranDetailScreen() {
  const params = useLocalSearchParams<{ tagihanId?: string | string[] }>();
  const tagihanId = Array.isArray(params.tagihanId) ? params.tagihanId[0] : params.tagihanId;
  return (
    <ScreenShell>
      {(profil) => <Isi profil={profil} tagihanId={tagihanId ?? null} />}
    </ScreenShell>
  );
}

function Isi({ profil, tagihanId }: { profil: Profil; tagihanId: string | null }) {
  const tagihan = useTagihanDetail(tagihanId);
  const transaksi = useTransaksiTagihan(tagihanId, profil.uid);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeData>(null);

  const data = tagihan.data;
  const pendingOrder =
    transaksi.data.find((t) => t.status === 'pending')?.orderId ?? data?.lastOrderId ?? null;

  async function bayar() {
    if (!data) return;
    setBusy(true);
    setNotice(null);
    try {
      const hasil = await buatPembayaran(data.id);
      await WebBrowser.openBrowserAsync(hasil.redirectUrl);
      setNotice({
        tipe: 'ok',
        teks: 'Jendela pembayaran ditutup. Status akan diperbarui otomatis setelah pembayaran dikonfirmasi.',
      });
      const status = await cekStatusPembayaran(hasil.orderId).catch(() => null);
      if (status === 'success') {
        setNotice({ tipe: 'ok', teks: 'Pembayaran berhasil. Tagihan sudah lunas.' });
      } else if (status === 'failed') {
        setNotice({ tipe: 'err', teks: 'Pembayaran gagal. Silakan coba lagi.' });
      }
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    } finally {
      setBusy(false);
    }
  }

  async function cek() {
    if (!pendingOrder) return;
    setBusy(true);
    setNotice(null);
    try {
      const status = await cekStatusPembayaran(pendingOrder);
      if (status === 'success') {
        setNotice({ tipe: 'ok', teks: 'Pembayaran berhasil. Tagihan sudah lunas.' });
      } else if (status === 'failed') {
        setNotice({ tipe: 'err', teks: 'Pembayaran gagal atau kedaluwarsa. Silakan bayar ulang.' });
      } else {
        setNotice({ tipe: 'ok', teks: 'Pembayaran masih menunggu penyelesaian.' });
      }
    } catch (e) {
      setNotice({ tipe: 'err', teks: pesanError(e) });
    } finally {
      setBusy(false);
    }
  }

  const error = tagihan.error ?? transaksi.error;

  return (
    <View style={styles.content}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <ThemedText type="linkPrimary">← Kembali</ThemedText>
      </Pressable>

      <ThemedText type="subtitle" style={styles.pageTitle}>Pembayaran Denda</ThemedText>

      <Notice
        data={error ? { tipe: 'err', teks: error } : null}
        onRetry={() => {
          tagihan.retry();
          transaksi.retry();
        }}
      />
      <Notice data={notice} />

      {tagihan.loading ? (
        <LoadingRow />
      ) : !data ? (
        <EmptyState title="Tagihan tidak ditemukan" message="Tagihan mungkin sudah dihapus." />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <ThemedText type="smallBold" style={styles.judul}>
                {data.namaPraktikum || 'Denda Praktikum'}
              </ThemedText>
              <StatusPembayaranBadge status={data.statusPembayaran} />
            </View>
            <Info label="Laboratorium" nilai={data.namaLab || '-'} />
            <Info
              label="Sesi"
              nilai={data.tanggalSesi ? tanggalDariIso(data.tanggalSesi) : '-'}
            />
            <Info label="Terlambat" nilai={`${data.terlambatMenit} menit`} />
            <Info label="Nominal" nilai={rupiah(data.nominal)} />
          </Card>

          {data.statusPembayaran === 'success' ? (
            <Notice
              data={{ tipe: 'ok', teks: `Tagihan lunas${data.dibayarPada ? ` pada ${tanggalPendek(data.dibayarPada)} ${jamMenit(data.dibayarPada)}` : ''}.` }}
            />
          ) : data.statusPembayaran === 'pending' ? (
            <PrimaryButton
              label={busy ? 'Memeriksa…' : 'Cek Status Pembayaran'}
              onPress={cek}
              disabled={busy || !pendingOrder}
              variant="outline"
            />
          ) : (
            <PrimaryButton
              label={busy ? 'Menyiapkan…' : 'Bayar Sekarang'}
              onPress={bayar}
              disabled={busy}
            />
          )}

          <ThemedText type="smallBold" style={styles.section}>
            Riwayat Transaksi
          </ThemedText>
          {transaksi.data.length === 0 ? (
            <EmptyState title="Belum ada transaksi" message="Transaksi untuk tagihan ini akan tampil di sini." />
          ) : (
            transaksi.data.map((item) => <TransaksiRow key={item.orderId} transaksi={item} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Info({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={styles.rowBetween}>
      <ThemedText themeColor="textSecondary" style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{nilai}</ThemedText>
    </View>
  );
}

function TransaksiRow({ transaksi }: { transaksi: Transaksi }) {
  const waktu = transaksi.dibuatPada
    ? `${tanggalPendek(transaksi.dibuatPada)} ${jamMenit(transaksi.dibuatPada)}`
    : '…';
  const label =
    transaksi.status === 'success' ? 'Berhasil' : transaksi.status === 'pending' ? 'Menunggu' : 'Gagal';
  return (
    <Card style={styles.card}>
      <View style={styles.rowBetween}>
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
  back: { paddingVertical: Spacing.two, alignSelf: 'flex-start' },
  pressed: { opacity: 0.6 },
  pageTitle: { fontSize: 22, lineHeight: 28, marginBottom: Spacing.two },
  list: { paddingBottom: Spacing.six, gap: 4 },
  card: { gap: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  judul: { flex: 1, fontSize: 16 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  section: { marginTop: Spacing.three, marginBottom: Spacing.one },
  small: { fontSize: 13 },
  orderId: { flex: 1, fontSize: 13 },
});
