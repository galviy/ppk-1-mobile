import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { sendPaymentPush } from '../services/expo-push';
import { getTagihan, getUserData } from '../services/firestore-payments';

export const notificationsRouter = Router();

function normalisasiPeran(role: string | undefined): string | undefined {
  return role === 'asisten' ? 'asprak' : role;
}

notificationsRouter.post('/tagihan', requireAuth, async (req, res) => {
  const callerUid = (req as AuthenticatedRequest).user?.uid ?? '';
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

    const caller = await getUserData(callerUid);
    const peran = normalisasiPeran(caller?.role);
    const boleh =
      tagihan.uid === callerUid || peran === 'aslab' || peran === 'asprak';
    if (!boleh) {
      res.status(403).json({ error: 'Tidak berwenang mengirim notifikasi tagihan ini.' });
      return;
    }

    const penerima = await getUserData(tagihan.uid);
    if (!penerima?.expoPushToken) {
      res.json({ sent: false, reason: 'token-tidak-ada' });
      return;
    }

    const sent = await sendPaymentPush(penerima.expoPushToken, 'tagihan_dibuat', {
      tagihanId: tagihan.id,
      sesiId: tagihan.sesiId,
      nominal: String(tagihan.nominal),
    });

    res.json({ sent });
  } catch (error) {
    console.error('[notifications] Gagal mengirim notifikasi tagihan:', error);
    res.status(500).json({ error: 'Gagal mengirim notifikasi tagihan.' });
  }
});
