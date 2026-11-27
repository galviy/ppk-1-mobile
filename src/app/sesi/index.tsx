// Daftar jadwal berada di tab peran masing-masing (real-time, Firestore).
// Rute ini hanya mengarahkan ke sana agar tautan lama tetap berfungsi.
import { Href, Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '../../context/AuthContext';
import { getHomeRouteForRole } from '../../lib/role-routing';

export default function DaftarJadwal() {
  const { user } = useAuth();
  if (!user) return null; // NavigationGuard (SRS-01) mengarahkan ke login
  return <Redirect href={getHomeRouteForRole(user.role) as Href} />;
}
