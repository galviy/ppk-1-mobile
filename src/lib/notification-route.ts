import type { PushNotificationPayload } from '../data/types';

const SAFE_DEEP_LINK_SEGMENTS = new Set([
  'pembayaran',
  'presensi',
  'sesi',
  'izin',
]);

/** Memastikan segmen ID rute tunggal aman (non-kosong, tanpa path traversal atau pemisah URL). */
export function isSafeRouteId(id: string | null | undefined): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..') return false;
  return !/[\\/?#\s]|\.\./.test(trimmed);
}

function cleanRouteId(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw).trim();
    return isSafeRouteId(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Mem-parse URL deep link aplikasi (`ppk1://...`) atau path relatif menjadi rute Expo Router (FR-S4-01.7).
 * Contoh:
 * - `ppk1://pembayaran/sesi1_uid1` -> `/pembayaran/sesi1_uid1`
 * - `ppk1:///pembayaran/sesi1_uid1?order_id=ORD-1&transaction_status=settlement` -> `/pembayaran/sesi1_uid1`
 */
export function resolveAppDeepLinkRoute(
  rawUrl: string | null | undefined,
): string | null {
  if (typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  let pathText = '';
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) {
      return null;
    }
    pathText = trimmed;
  } else {
    const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/.exec(trimmed);
    if (!schemeMatch || schemeMatch[1].toLowerCase() !== 'ppk1') {
      return null;
    }
    pathText = schemeMatch[2];
  }

  const withoutHash = pathText.split('#')[0] ?? '';
  const withoutQuery = withoutHash.split('?')[0] ?? '';
  const parts = withoutQuery.split('/').filter(Boolean);

  if (parts.length !== 2) {
    return null;
  }

  const [segment, rawId] = parts;
  if (!SAFE_DEEP_LINK_SEGMENTS.has(segment)) {
    return null;
  }

  const id = cleanRouteId(rawId);
  if (!id) {
    return null;
  }

  return `/${segment}/${id}`;
}

/**
 * Menerjemahkan payload notifikasi menjadi rute Expo Router sesuai kontrak Sprint 3 + Sprint 4 (S3-01.5, FR-S4-01.6):
 * - `sesi_dibuka` -> `/presensi/${sesiId}`
 * - `jadwal_berubah` -> `/sesi/${sesiId}`
 * - `izin_diputuskan` -> `/izin/${izinId}`
 * - `tagihan_dibuat` -> `/pembayaran/${tagihanId}`
 * - `pembayaran_berhasil` -> `/pembayaran/${tagihanId}`
 * - `pembayaran_gagal` -> `/pembayaran/${tagihanId}`
 */
export function resolveNotificationRoute(
  data: Record<string, unknown> | PushNotificationPayload | null | undefined,
): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as Record<string, unknown>;
  const event = typeof payload.event === 'string' ? payload.event.trim() : '';
  const sesiId =
    typeof payload.sesiId === 'string' ? cleanRouteId(payload.sesiId) : null;
  const izinId =
    typeof payload.izinId === 'string' ? cleanRouteId(payload.izinId) : null;
  const tagihanId =
    typeof payload.tagihanId === 'string'
      ? cleanRouteId(payload.tagihanId)
      : null;

  switch (event) {
    case 'sesi_dibuka':
      return sesiId ? `/presensi/${sesiId}` : null;
    case 'jadwal_berubah':
      return sesiId ? `/sesi/${sesiId}` : null;
    case 'izin_diputuskan':
      return izinId ? `/izin/${izinId}` : null;
    case 'tagihan_dibuat':
    case 'pembayaran_berhasil':
    case 'pembayaran_gagal':
      return tagihanId ? `/pembayaran/${tagihanId}` : null;
    default: {
      if (typeof payload.route === 'string') {
        const parsed = resolveAppDeepLinkRoute(payload.route);
        if (parsed) return parsed;
        if (
          payload.route.startsWith('/') &&
          !payload.route.startsWith('//') &&
          !payload.route.includes('..')
        ) {
          return payload.route;
        }
      }
      if (typeof payload.url === 'string') {
        const parsed = resolveAppDeepLinkRoute(payload.url);
        if (parsed) return parsed;
        if (
          payload.url.startsWith('/') &&
          !payload.url.startsWith('//') &&
          !payload.url.includes('..')
        ) {
          return payload.url;
        }
      }
      return null;
    }
  }
}
