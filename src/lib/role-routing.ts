import type { CanonicalRole } from '../data/types';

export type HomeRoute = '/aslab' | '/asprak' | '/praktikan';
export type LegacyAsistenTarget =
  | '/asprak'
  | '/asprak/rekap'
  | '/asprak/izin'
  | '/asprak/maps'
  | '/aslab/laboratorium';

export const PROTECTED_SEGMENTS: ReadonlySet<string> = new Set([
  'aslab',
  'asprak',
  'asisten',
  'praktikan',
  'izin',
  'presensi',
  'maps',
  'sesi',
  'pembayaran',
  'pilih-identitas',
]);

/** Memetakan peran kanonik maupun legacy `'asisten'` ke peran kanonik Sprint 4. */
export function normalizeCanonicalRole(
  role: string | null | undefined,
): CanonicalRole | null {
  if (role === 'aslab') return 'aslab';
  if (role === 'asprak' || role === 'asisten') return 'asprak';
  if (role === 'praktikan') return 'praktikan';
  return null;
}

/** Mengembalikan rute dashboard utama untuk masing-masing peran (FR-S4-01.4). */
export function getHomeRouteForRole(role: string | null | undefined): HomeRoute {
  const canonical = normalizeCanonicalRole(role);
  if (canonical === 'aslab') return '/aslab';
  if (canonical === 'asprak') return '/asprak';
  return '/praktikan';
}

/**
 * Menentukan rute pengalihan untuk NavigationGuard RBAC 3 peran (FR-S4-01.4):
 * - User belum login yang mengakses segmen terproteksi diarahkan ke `/(auth)/login`.
 * - User login di `(auth)` / `index` / `pilih-identitas` diarahkan ke dashboard perannya.
 * - Akses silang `/aslab/*`, `/asprak/*`, `/praktikan/*`, `/asisten/*`, dan `/pembayaran/*` diblokir.
 */
export function resolveRoleGuardRedirect(
  role: string | null | undefined,
  firstSegment: string | undefined,
): '/(auth)/login' | HomeRoute | null {
  if (!role) {
    return firstSegment && PROTECTED_SEGMENTS.has(firstSegment)
      ? '/(auth)/login'
      : null;
  }

  const canonical = normalizeCanonicalRole(role) ?? 'praktikan';
  const home = getHomeRouteForRole(canonical);

  if (
    !firstSegment ||
    firstSegment === 'index' ||
    firstSegment === '(auth)' ||
    firstSegment === 'pilih-identitas'
  ) {
    return home;
  }

  if (firstSegment === 'aslab' && canonical !== 'aslab') {
    return home;
  }
  if (firstSegment === 'asprak' && canonical !== 'asprak') {
    return home;
  }
  if (firstSegment === 'praktikan' && canonical !== 'praktikan') {
    return home;
  }
  if (firstSegment === 'asisten' && canonical !== 'asprak') {
    return home;
  }
  if (firstSegment === 'pembayaran' && canonical !== 'praktikan') {
    return home;
  }

  return null;
}

/** Memetakan subpath rute lama `/asisten/*` ke rute baru `/asprak/*` atau `/aslab/laboratorium` (FR-S4-01.5). */
export function resolveLegacyAsistenRedirect(
  rest?: string | string[],
): LegacyAsistenTarget {
  const first = Array.isArray(rest)
    ? rest[0]
    : typeof rest === 'string'
      ? rest.split('/').filter(Boolean)[0]
      : undefined;

  switch (first) {
    case 'rekap':
      return '/asprak/rekap';
    case 'izin':
      return '/asprak/izin';
    case 'maps':
      return '/asprak/maps';
    case 'laboratorium':
      return '/aslab/laboratorium';
    default:
      return '/asprak';
  }
}
