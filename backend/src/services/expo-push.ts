import { config } from '../config';

export type PaymentPushEvent = 'tagihan_dibuat' | 'pembayaran_berhasil' | 'pembayaran_gagal';

const POLA_TOKEN = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: 'default';
  priority: 'high';
};

export function isValidExpoPushToken(token: unknown): token is string {
  return typeof token === 'string' && POLA_TOKEN.test(token);
}

const JUDUL: Record<PaymentPushEvent, string> = {
  tagihan_dibuat: 'Tagihan denda baru',
  pembayaran_berhasil: 'Pembayaran berhasil',
  pembayaran_gagal: 'Pembayaran gagal',
};

const ISI: Record<PaymentPushEvent, string> = {
  tagihan_dibuat: 'Anda memiliki tagihan denda praktikum. Buka aplikasi untuk membayar.',
  pembayaran_berhasil: 'Pembayaran denda Anda telah berhasil.',
  pembayaran_gagal: 'Pembayaran denda gagal atau kedaluwarsa. Silakan coba lagi.',
};

export function buildPaymentPush(
  token: unknown,
  event: PaymentPushEvent,
  data: Record<string, string>,
): ExpoPushMessage | null {
  if (!isValidExpoPushToken(token)) return null;

  return {
    to: token,
    title: JUDUL[event],
    body: ISI[event],
    data: { ...data, event },
    sound: 'default',
    priority: 'high',
  };
}

/** Best-effort: kegagalan push tidak boleh menggagalkan operasi pembayaran. */
export async function sendPaymentPush(
  token: unknown,
  event: PaymentPushEvent,
  data: Record<string, string>,
): Promise<boolean> {
  const message = buildPaymentPush(token, event, data);
  if (!message) return false;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (config.expo.accessToken) {
    headers.Authorization = `Bearer ${config.expo.accessToken}`;
  }

  try {
    const response = await fetch(config.expo.pushUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      console.warn(`[push] Expo Push API menolak push (${response.status}).`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[push] Gagal mengirim push pembayaran:', error);
    return false;
  }
}
