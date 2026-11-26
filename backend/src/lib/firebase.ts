import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

function initFirebase(): void {
  if (getApps().length > 0) return;

  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT ?? '').trim();
  const credential = raw ? cert(JSON.parse(raw)) : applicationDefault();
  initializeApp({ credential });
}

export function firestore() {
  initFirebase();
  return getFirestore();
}

export function adminAuth() {
  initFirebase();
  return getAuth();
}

export { FieldValue };
