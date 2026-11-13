// Daftar jadwal berada di tab peran masing-masing (real-time, Firestore).
// Rute ini hanya mengarahkan ke sana agar tautan lama tetap berfungsi.
import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '@/context/AuthContext';

export default function DaftarJadwal() {
  const { user } = useAuth();
  if (!user) return null; // NavigationGuard (SRS-01) mengarahkan ke login
  return <Redirect href={user.role === 'asisten' ? '/asisten' : '/praktikan'} />;
}
