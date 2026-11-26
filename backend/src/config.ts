import 'dotenv/config';

const isProduction = (process.env.MIDTRANS_IS_PRODUCTION ?? 'false').toLowerCase() === 'true';

function readUrl(name: string, fallback: string): string {
  const value = (process.env[name] ?? '').trim();
  return (value || fallback).replace(/\/+$/, '');
}

export const config = {
  port: Number.parseInt(process.env.PORT ?? '3000', 10) || 3000,
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  midtrans: {
    serverKey: (process.env.MIDTRANS_SERVER_KEY ?? '').trim(),
    clientKey: (process.env.MIDTRANS_CLIENT_KEY ?? '').trim(),
    isProduction,
    snapBaseUrl: readUrl(
      'MIDTRANS_SNAP_BASE_URL',
      isProduction
        ? 'https://app.midtrans.com/snap/v1'
        : 'https://app.sandbox.midtrans.com/snap/v1',
    ),
    apiBaseUrl: readUrl(
      'MIDTRANS_API_BASE_URL',
      isProduction ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2',
    ),
  },
  expo: {
    pushUrl: readUrl('EXPO_PUSH_URL', 'https://exp.host/--/api/v2/push/send'),
    accessToken: (process.env.EXPO_ACCESS_TOKEN ?? '').trim(),
  },
};

export function midtransServerKey(): string {
  if (!config.midtrans.serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum diatur pada environment backend.');
  }
  return config.midtrans.serverKey;
}
