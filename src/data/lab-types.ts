
export type Laboratorium = {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
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