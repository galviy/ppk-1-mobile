import { Router } from 'express';
import { midtransServerKey } from '../config';
import { verifyMidtransSignature, type MidtransNotification } from '../lib/signature';
import { mapMidtransStatus } from '../lib/status';
import { sendPaymentPush } from '../services/expo-push';
import { applyPaymentStatus, getUserData } from '../services/firestore-payments';

export const webhookRouter = Router();

webhookRouter.post('/webhook', async (req, res) => {
  const notification = (req.body ?? {}) as MidtransNotification;

  if (!notification.order_id || !notification.signature_key) {
    res.status(400).json({ error: 'Payload webhook tidak lengkap.' });
    return;
  }

  let serverKey: string;
  try {
    serverKey = midtransServerKey();
  } catch (error) {
    console.error('[webhook] Server belum dikonfigurasi:', (error as Error).message);
    res.status(500).json({ error: 'Server pembayaran belum dikonfigurasi.' });
    return;
  }

  if (!verifyMidtransSignature(notification, serverKey)) {
    res.status(403).json({ error: 'Signature webhook tidak valid.' });
    return;
  }

  const mapped = mapMidtransStatus(
    notification.transaction_status,
    notification.fraud_status,
  );

  try {
    const update = await applyPaymentStatus(notification.order_id, mapped, {
      transactionStatus: notification.transaction_status,
      transactionId: notification.transaction_id,
      paymentType: notification.payment_type,
    });

    if (update?.event && update.uid) {
      const penerima = await getUserData(update.uid).catch(() => null);
      if (penerima?.expoPushToken) {
        await sendPaymentPush(penerima.expoPushToken, update.event, {
          tagihanId: update.tagihanId,
          orderId: notification.order_id,
          status: update.event === 'pembayaran_berhasil' ? 'success' : 'failed',
        });
      }
    }

    res.json({ ok: true, changed: update?.changed ?? false });
  } catch (error) {
    console.error('[webhook] Gagal memproses webhook:', error);
    res.status(500).json({ error: 'Gagal memproses webhook.' });
  }
});
