import { config, midtransServerKey } from '../config';

export class MidtransError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'MidtransError';
    this.status = status;
    this.body = body;
  }
}

function authorizationHeader(): string {
  const encoded = Buffer.from(`${midtransServerKey()}:`, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}

export type SnapTransactionInput = {
  orderId: string;
  grossAmount: number;
  itemName: string;
  customer: {
    firstName: string;
    email?: string;
    phone?: string;
  };
};

export type SnapTransactionResult = {
  token: string;
  redirectUrl: string;
};

export async function createSnapTransaction(
  input: SnapTransactionInput,
): Promise<SnapTransactionResult> {
  const response = await fetch(`${config.midtrans.snapBaseUrl}/transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorizationHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: Math.round(input.grossAmount),
      },
      item_details: [
        {
          id: 'DENDA',
          price: Math.round(input.grossAmount),
          quantity: 1,
          name: input.itemName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: input.customer.firstName,
        email: input.customer.email,
        phone: input.customer.phone,
      },
    }),
  });

  const json = (await response.json().catch(() => null)) as
    | { token?: string; redirect_url?: string; error_messages?: string[] }
    | null;

  if (!response.ok) {
    const detail = json?.error_messages?.join('; ') ?? 'Midtrans menolak permintaan.';
    throw new MidtransError(detail, response.status, json);
  }
  if (!json?.token || !json?.redirect_url) {
    throw new MidtransError('Respons Snap tidak memuat token/redirect_url.', response.status, json);
  }

  return { token: json.token, redirectUrl: json.redirect_url };
}

export type MidtransStatusResult = {
  transactionStatus: string;
  fraudStatus?: string;
  transactionId?: string;
  paymentType?: string;
  raw: unknown;
};

export async function getMidtransTransactionStatus(
  orderId: string,
): Promise<MidtransStatusResult> {
  const response = await fetch(
    `${config.midtrans.apiBaseUrl}/${encodeURIComponent(orderId)}/status`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: authorizationHeader(),
      },
    },
  );

  const json = (await response.json().catch(() => null)) as
    | {
        transaction_status?: string;
        fraud_status?: string;
        transaction_id?: string;
        payment_type?: string;
        status_message?: string;
      }
    | null;

  if (!response.ok || !json?.transaction_status) {
    throw new MidtransError(
      json?.status_message ?? 'Gagal membaca status transaksi Midtrans.',
      response.status,
      json,
    );
  }

  return {
    transactionStatus: json.transaction_status,
    fraudStatus: json.fraud_status,
    transactionId: json.transaction_id,
    paymentType: json.payment_type,
    raw: json,
  };
}
