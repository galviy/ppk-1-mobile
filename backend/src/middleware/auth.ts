import type { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../lib/firebase';

export type AuthenticatedRequest = Request & { user?: { uid: string } };

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' });
    return;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    (req as AuthenticatedRequest).user = { uid: decoded.uid };
    next();
  } catch (error) {
    console.warn('[auth] Verifikasi ID token gagal:', (error as Error).message);
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa.' });
  }
}
