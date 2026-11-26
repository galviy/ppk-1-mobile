
export type Laboratorium = {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
  lokasi?: string;
  mataKuliahKode?: string;
  mataKuliahNama?: string;
  gracePeriodMenit?: number;
  nominalDenda?: number;
  aslabUid?: string;
  asprakUids?: string[];
  praktikanUids?: string[];
  defaultKelasId?: string;
};

export type InputLab = Omit<Laboratorium, 'id'>;

export type FormLab = {
  nama: string;
  kode: string;
  deskripsi: string;
  latitude: string;
  longitude: string;
  radiusMeter: string;
};