export type StatusIzin = 'menunggu' | 'diterima' | 'ditolak';

export type SentimentLabel = 'negatif' | 'netral' | 'positif';

export type SentimentStatus = 'predicted' | 'empty_input' | 'unknown_vocabulary' | 'error';

export type ReasonSentiment = {
  label: SentimentLabel | null;
  status: SentimentStatus;
  source: 'model-edom';
  experimental: true;
};

export type InputIzin = {
  sesiId: string;
  alasan: string;
};

export type Izin = {
  id: string; // `${sesiId}_${uid}`
  uid: string;
  nama: string;
  kelasId: string;
  sesiId: string;
  alasan: string;
  sentimen: ReasonSentiment | null;
  status: StatusIzin;
  diajukanPada: Date | null;
  diputuskanOleh: string | null;
  diputuskanPada: Date | null;
};

export const STATUS_IZIN_LABEL: Record<StatusIzin, string> = {
  menunggu: 'Menunggu',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
};

export const SENTIMENT_LABEL: Record<SentimentLabel, string> = {
  negatif: 'Negatif',
  netral: 'Netral',
  positif: 'Positif',
};
