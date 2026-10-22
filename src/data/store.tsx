import React, { createContext, useContext, useState } from 'react';
import { router } from 'expo-router';

import {
  DUMMY_ASISTEN,
  DUMMY_PRAKTIKAN,
  DUMMY_SESI,
  INITIAL_PRESENSI,
} from './dummy';
import {
  Asisten,
  Praktikan,
  PresensiEntry,
  Role,
  Sesi,
  UserIdentitas,
} from './types';

export interface AppContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
  identitas: UserIdentitas | null;
  setIdentitas: (identitas: UserIdentitas | null) => void;
  daftarSesi: Sesi[];
  setDaftarSesi: React.Dispatch<React.SetStateAction<Sesi[]>>;
  setSesiStatus: (sesiId: string, status: Sesi['status']) => void;
  presensi: Record<string, PresensiEntry[]>;
  tambahPresensi: (sesiId: string, entri: PresensiEntry) => boolean;
  daftarPraktikan: Praktikan[];
  daftarAsisten: Asisten[];
  gantiPeran: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [identitas, setIdentitas] = useState<UserIdentitas | null>(null);
  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>(DUMMY_SESI);
  const [presensi, setPresensi] = useState<Record<string, PresensiEntry[]>>(INITIAL_PRESENSI);

  const setSesiStatus = (sesiId: string, status: Sesi['status']) => {
    setDaftarSesi((prev) =>
      prev.map((sesi) => (sesi.id === sesiId ? { ...sesi, status } : sesi))
    );
  };

  const tambahPresensi = (sesiId: string, entri: PresensiEntry): boolean => {
    const list = presensi[sesiId] || [];
    const sudahAda = list.some((item) => item.praktikanId === entri.praktikanId);
    if (sudahAda) {
      return false;
    }

    setPresensi((prev) => ({
      ...prev,
      [sesiId]: [...(prev[sesiId] || []), entri],
    }));
    return true;
  };

  const gantiPeran = () => {
    setRole(null);
    setIdentitas(null);
    router.replace('/');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        identitas,
        setIdentitas,
        daftarSesi,
        setDaftarSesi,
        setSesiStatus,
        presensi,
        tambahPresensi,
        daftarPraktikan: DUMMY_PRAKTIKAN,
        daftarAsisten: DUMMY_ASISTEN,
        gantiPeran,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
