export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
export const MAKS_PUSH_PER_REQUEST = 100;
export const MAKS_UID_PER_QUERY = 30;

const POLA_TOKEN = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: 'default';
  priority: 'high';
};

export type IsiPush = {
  title: string;
  body: string;
  data: Record<string, string>;
};

export function isExpoPushToken(token: unknown): token is string {
  return typeof token === 'string' && POLA_TOKEN.test(token);
}

export function chunk<T>(items: readonly T[], size: number = MAKS_PUSH_PER_REQUEST): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError('Ukuran chunk harus bilangan bulat minimal 1.');
  }
  const hasil: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    hasil.push(items.slice(i, i + size));
  }
  return hasil;
}

export function tokenUnik(values: readonly unknown[]): string[] {
  const hasil = new Set<string>();
  for (const value of values) {
    if (isExpoPushToken(value)) hasil.add(value);
  }
  return [...hasil];
}

export function buatPesanPush(token: unknown, isi: IsiPush): ExpoPushMessage | null {
  if (!isExpoPushToken(token)) return null;

  return {
    to: token,
    title: isi.title,
    body: isi.body,
    data: { ...isi.data },
    sound: 'default',
    priority: 'high',
  };
}
