import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { mapMidtransStatus } from '../lib/status';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import {
  applyPaymentStatus,
  createPendingTransaksi,
  getTagihan,
  getTransaksi,
  markTransaksiFailed,
  updateTransaksiSnap,
} from '../services/firestore-payments';
import {
  MidtransError,
  createSnapTransaction,
  getMidtransTransactionStatus,
} from '../services/midtrans';

export const paymentsRouter = Router();

/** order_id Midtrans: unik, aman karakter, dan <= 50 karakter. */
export function buatOrderId(): string {
  return `ORD-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
}

paymentsRouter.post('/create', requireAuth, async (req, res) => {
  const uid = (req as AuthenticatedRequest).user?.uid ?? '';
  const tagihanId = String(req.body?.tagihanId ?? '').trim();
  if (!tagihanId) {
    res.status(400).json({ error: 'tagihanId wajib diisi.' });
    return;
  }

  try {
    const tagihan = await getTagihan(tagihanId);
    if (!tagihan) {
      res.status(404).json({ error: 'Tagihan tidak ditemukan.' });
      return;
    }
    if (tagihan.uid !== uid) {
      res.status(403).json({ error: 'Tagihan bukan milik pengguna ini.' });
      return;
    }
    if (tagihan.statusPembayaran === 'success') {
      res.status(409).json({ error: 'Tagihan sudah lunas.' });
      return;
    }
    if (!Number.isFinite(tagihan.nominal) || tagihan.nominal <= 0) {
      res.status(400).json({ error: 'Nominal tagihan tidak valid.' });
      return;
    }

    const orderId = buatOrderId();
    await createPendingTransaksi({
      orderId,
      tagihan,
      snapToken: '',
      redirectUrl: '',
    });

    try {
      const snap = await createSnapTransaction({
        orderId,
        grossAmount: tagihan.nominal,
        itemName: `Denda ${tagihan.namaPraktikum || 'praktikum'}`,
        customer: { firstName: tagihan.nama || 'Praktikan' },
      });
      await updateTransaksiSnap(orderId, snap.token, snap.redirectUrl);
      res.json({ orderId, snapToken: snap.token, redirectUrl: snap.redirectUrl });
    } catch (error) {
      await markTransaksiFailed(
        orderId,
        error instanceof Error ? error.message : 'Gagal membuat transaksi Midtrans.',
      ).catch(() => undefined);

      if (error instanceof MidtransError) {
        res.status(502).json({ error: error.message });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('[payments] Gagal membuat transaksi:', error);
    res.status(500).json({ error: 'Gagal membuat transaksi pembayaran.' });
  }
});

paymentsRouter.get('/:orderId/status', requireAuth, async (req, res) => {
  const uid = (req as AuthenticatedRequest).user?.uid ?? '';
  const orderId = String(req.params.orderId ?? '').trim();
  if (!orderId) {
    res.status(400).json({ error: 'orderId wajib diisi.' });
    return;
  }

  try {
    const transaksi = await getTransaksi(orderId);
    if (!transaksi) {
      res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
      return;
    }
    if (transaksi.uid !== uid) {
      res.status(403).json({ error: 'Transaksi bukan milik pengguna ini.' });
      return;
    }

    const status = await getMidtransTransactionStatus(orderId);
    const mapped = mapMidtransStatus(status.transactionStatus, status.fraudStatus);
    const update = await applyPaymentStatus(orderId, mapped, {
      transactionStatus: status.transactionStatus,
      transactionId: status.transactionId,
      paymentType: status.paymentType,
    });

    res.json({ orderId, status: update?.status ?? mapped });
  } catch (error) {
    if (error instanceof MidtransError) {
      res.status(502).json({ error: error.message });
      return;
    }
    console.error('[payments] Gagal sinkronisasi status:', error);
    res.status(500).json({ error: 'Gagal menyinkronkan status pembayaran.' });
  }
});
