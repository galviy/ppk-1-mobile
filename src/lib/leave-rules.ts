import type { Sesi } from '@/data/models';

export const REASON_MIN_LENGTH = 3;
export const REASON_MAX_LENGTH = 500;

export type ReasonValidation = { valid: true; value: string } | { valid: false; error: string };

export function validateReason(raw: string): ReasonValidation {
  const value = raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (value.length === 0) {
    return { valid: false, error: 'Alasan tidak boleh kosong.' };
  }
  if (value.length < REASON_MIN_LENGTH) {
    return { valid: false, error: `Alasan minimal ${REASON_MIN_LENGTH} karakter.` };
  }
  if (value.length > REASON_MAX_LENGTH) {
    return { valid: false, error: `Alasan maksimal ${REASON_MAX_LENGTH} karakter.` };
  }
  return { valid: true, value };
}

// Sesi yang sudah ditutup tidak bisa diajukan izin.
export function isSessionEligibleForLeave(sesi: Sesi): boolean {
  return sesi.status !== 'ditutup';
}

export type SessionLeaveEligibility = {
  eligible: boolean;
  reason?: string;
};

export function checkSessionLeaveEligibility(
  sesi: Sesi,
  opts?: { sudahPresensi?: boolean; sudahIzin?: boolean },
): SessionLeaveEligibility {
  if (opts?.sudahIzin) {
    return { eligible: false, reason: 'Sudah diajukan izin' };
  }
  if (opts?.sudahPresensi) {
    return { eligible: false, reason: 'Sudah tercatat hadir' };
  }
  if (!isSessionEligibleForLeave(sesi)) {
    return { eligible: false, reason: 'Sesi sudah ditutup' };
  }
  return { eligible: true };
}
