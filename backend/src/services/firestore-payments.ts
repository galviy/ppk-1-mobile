import { FieldValue, firestore } from '../lib/firebase';
import {
  resolvePaymentUpdate,
  type PaymentNotificationEvent,
  type TagihanStatus,
} from '../lib/payment-state';
import type { PaymentStatus } from '../lib/status';

export type TagihanData = {
  id: string;
  uid: string;
  nama: string;
  nim: string;
  sesiId: string;
  namaPraktikum: string;
  laboratoriumId: string;
  nominal: number;
  statusPembayaran: TagihanStatus;
  lastOrderId: string | null;
};

export type TransaksiData = {
  orderId: string;
  tagihanId: string;
  uid: string;
  status: PaymentStatus;
};

export type UserData = {
  role?: string;
  expoPushToken?: string | null;
};

export type CreateTransaksiInput = {
  orderId: string;
  tagihan: TagihanData;
  snapToken: string;
  redirectUrl: string;
};

export type PaymentStatusInfo = {
  transactionStatus?: string;
  transactionId?: string;
  paymentType?: string;
};

export type WebhookUpdate = {
  tagihanId: string;
  uid: string;
  event: PaymentNotificationEvent | null;
  status: TagihanStatus;
  changed: boolean;
};

function normalizeTagihanStatus(value: unknown): TagihanStatus {
  return value === 'pending' || value === 'success' || value === 'failed' ? value : 'unpaid';
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getTagihan(tagihanId: string): Promise<TagihanData | null> {
  const snap = await firestore().collection('tagihan').doc(tagihanId).get();
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    uid: String(d.uid ?? ''),
    nama: String(d.nama ?? ''),
    nim: String(d.nim ?? ''),
    sesiId: String(d.sesiId ?? ''),
    namaPraktikum: String(d.namaPraktikum ?? ''),
    laboratoriumId: String(d.laboratoriumId ?? ''),
    nominal: toNumber(d.nominal),
    statusPembayaran: normalizeTagihanStatus(d.statusPembayaran),
    lastOrderId: (d.lastOrderId as string | null | undefined) ?? null,
  };
}

export async function getTransaksi(orderId: string): Promise<TransaksiData | null> {
  const snap = await firestore().collection('transaksi').doc(orderId).get();
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  const status = d.status;
  return {
    orderId: snap.id,
    tagihanId: String(d.tagihanId ?? ''),
    uid: String(d.uid ?? ''),
    status: status === 'success' || status === 'failed' ? status : 'pending',
  };
}

export async function getUserData(uid: string): Promise<UserData | null> {
  const snap = await firestore().collection('users').doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  return {
    role: typeof d.role === 'string' ? d.role : undefined,
    expoPushToken: typeof d.expoPushToken === 'string' ? d.expoPushToken : null,
  };
}

export async function createPendingTransaksi(input: CreateTransaksiInput): Promise<void> {
  const { orderId, tagihan, snapToken, redirectUrl } = input;
  await firestore()
    .collection('transaksi')
    .doc(orderId)
    .set({
      orderId,
      tagihanId: tagihan.id,
      uid: tagihan.uid,
      nama: tagihan.nama,
      nim: tagihan.nim,
      sesiId: tagihan.sesiId,
      namaPraktikum: tagihan.namaPraktikum,
      laboratoriumId: tagihan.laboratoriumId,
      nominal: tagihan.nominal,
      status: 'pending',
      snapToken,
      redirectUrl,
      dibuatPada: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function updateTransaksiSnap(
  orderId: string,
  snapToken: string,
  redirectUrl: string,
): Promise<void> {
  await firestore()
    .collection('transaksi')
    .doc(orderId)
    .set({ snapToken, redirectUrl, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function markTransaksiFailed(orderId: string, reason: string): Promise<void> {
  await firestore()
    .collection('transaksi')
    .doc(orderId)
    .set(
      { status: 'failed', error: reason, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/**
 * Memperbarui transaksi + tagihan secara atomik dari status Midtrans.
 * Hanya backend (Admin SDK) yang boleh menulis `status`/`statusPembayaran`.
 * Subkoleksi presensi tidak pernah disentuh di sini.
 */
export async function applyPaymentStatus(
  orderId: string,
  mapped: PaymentStatus,
  info: PaymentStatusInfo,
): Promise<WebhookUpdate | null> {
  const db = firestore();
  const transaksiRef = db.collection('transaksi').doc(orderId);

  return db.runTransaction(async (tx) => {
    const transaksiSnap = await tx.get(transaksiRef);
    if (!transaksiSnap.exists) return null;

    const transaksi = transaksiSnap.data() ?? {};
    const tagihanId = String(transaksi.tagihanId ?? '');
    if (!tagihanId) return null;

    const tagihanRef = db.collection('tagihan').doc(tagihanId);
    const tagihanSnap = await tx.get(tagihanRef);
    if (!tagihanSnap.exists) return null;

    const tagihan = tagihanSnap.data() ?? {};
    const currentStatus = transaksi.status;
    const update = resolvePaymentUpdate(
      {
        transaksiStatus:
          currentStatus === 'success' || currentStatus === 'failed' ? currentStatus : 'pending',
        tagihanStatus: normalizeTagihanStatus(tagihan.statusPembayaran),
      },
      mapped,
    );

    if (update.changed) {
      const transaksiUpdate: Record<string, unknown> = {
        status: update.next.transaksiStatus,
        midtransTransactionStatus: info.transactionStatus ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (info.transactionId) transaksiUpdate.midtransTransactionId = info.transactionId;
      if (info.paymentType) transaksiUpdate.paymentType = info.paymentType;
      tx.update(transaksiRef, transaksiUpdate);

      const tagihanUpdate: Record<string, unknown> = {
        statusPembayaran: update.next.tagihanStatus,
        lastOrderId: orderId,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (update.next.tagihanStatus === 'success') {
        tagihanUpdate.dibayarPada = FieldValue.serverTimestamp();
      }
      tx.update(tagihanRef, tagihanUpdate);
    }

    return {
      tagihanId,
      uid: String(transaksi.uid ?? ''),
      event: update.notify,
      status: update.next.tagihanStatus,
      changed: update.changed,
    };
  });
}
