import type { Laboratorium } from '@/data/lab-types';

export type UserCoords = { latitude: number; longitude: number };

export type LabMapViewProps = {
  labs: Laboratorium[];
  /** null = lokasi pengguna belum tersedia/ditolak -> peta tetap tampil tanpa marker pengguna. */
  userLocation: UserCoords | null;
  selectedLabId: string | null;
  onSelectLab: (lab: Laboratorium) => void;
};