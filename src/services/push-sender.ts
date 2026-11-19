import { collection, doc, documentId, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  EXPO_PUSH_URL,
  MAKS_PUSH_PER_REQUEST,
  MAKS_UID_PER_QUERY,
  buatPesanPush,
  chunk,
  tokenUnik,
  type ExpoPushMessage,
  type IsiPush,
} from '@/lib/push';

export type DataNotifikasiSesi = {
  sesiId: string;
  kelasId: string;
  namaPraktikum?: string;
  tanggal?: string;
  jamMulai?: string;
  jamSelesai?: string;
};

export type DataNotifikasiIzin = {
  izinId: string;
  uid: string;
  status: 'diterima' | 'ditolak';
  namaPraktikum?: string;
};

function jumlahTiketBerhasil(json: unknown, cadangan: number): number {
  if (typeof json !== 'object' || json === null) return cadangan;
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data)) return cadangan;
  return data.filter(
    (tiket) =>
      typeof tiket === 'object' &&
      tiket !== null &&
      (tiket as { status?: unknown }).status === 'ok',
  ).length;
}

async function kirimKeTokens(tokens: string[], isi: IsiPush): Promise<number> {
  const pesan = tokens
    .map((token) => buatPesanPush(token, isi))
    .filter((item): item is ExpoPushMessage => item !== null);

  let terkirim = 0;

  for (const bagian of chunk(pesan, MAKS_PUSH_PER_REQUEST)) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bagian),
      });

      if (!res.ok) {
        console.warn(`[push] Expo Push API menolak batch (${res.status}).`);
        continue;
      }

      const json = await res.json().catch(() => null);
      terkirim += jumlahTiketBerhasil(json, bagian.length);
    } catch (error) {
      console.warn('[push] Gagal mengirim notifikasi:', error);
    }
  }

  return terkirim;
}

async function ambilTokenUids(uids: readonly string[]): Promise<string[]> {
  const unik = [...new Set(uids.filter((uid) => typeof uid === 'string' && uid.length > 0))];
  const tokens: unknown[] = [];

  for (const bagian of chunk(unik, MAKS_UID_PER_QUERY)) {
    try {
      const snap = await getDocs(
        query(collection(db, 'users'), where(documentId(), 'in', bagian)),
      );
      snap.forEach((dok) => tokens.push(dok.get('expoPushToken')));
    } catch (error) {
      console.warn('[push] Gagal mengambil token penerima:', error);
    }
  }

  return tokenUnik(tokens);
}

async function ambilTokenPeserta(kelasId: string): Promise<string[]> {
  try {
    const kelas = await getDoc(doc(db, 'kelas', kelasId));
    if (!kelas.exists()) return [];
    const peserta = kelas.get('pesertaUids');
    if (!Array.isArray(peserta)) return [];
    return ambilTokenUids(peserta.filter((uid): uid is string => typeof uid === 'string'));
  } catch (error) {
    console.warn('[push] Gagal mengambil peserta kelas:', error);
    return [];
  }
}

function ringkasJadwal(sesi: DataNotifikasiSesi): string {
  const jam =
    sesi.jamMulai && sesi.jamSelesai ? `${sesi.jamMulai}-${sesi.jamSelesai}` : undefined;
  return [sesi.tanggal, jam].filter(Boolean).join(' ');
}

export async function kirimNotifikasiSesiDibuka(sesi: DataNotifikasiSesi): Promise<number> {
  const tokens = await ambilTokenPeserta(sesi.kelasId);
  return kirimKeTokens(tokens, {
    title: 'Sesi praktikum dibuka',
    body: `${sesi.namaPraktikum ?? 'Sesi praktikum'} sudah dibuka.`,
    data: { event: 'sesi_dibuka', sesiId: sesi.sesiId, kelasId: sesi.kelasId },
  });
}

export async function kirimNotifikasiJadwalBerubah(sesi: DataNotifikasiSesi): Promise<number> {
  const tokens = await ambilTokenPeserta(sesi.kelasId);
  const jadwal = ringkasJadwal(sesi);
  return kirimKeTokens(tokens, {
    title: 'Jadwal praktikum berubah',
    body: jadwal
      ? `${sesi.namaPraktikum ?? 'Praktikum'} dijadwalkan ${jadwal}.`
      : `Jadwal ${sesi.namaPraktikum ?? 'praktikum'} berubah.`,
    data: { event: 'jadwal_berubah', sesiId: sesi.sesiId, kelasId: sesi.kelasId },
  });
}

export async function kirimNotifikasiIzinDiputuskan(izin: DataNotifikasiIzin): Promise<number> {
  const tokens = await ambilTokenUids([izin.uid]);
  return kirimKeTokens(tokens, {
    title: 'Keputusan pengajuan izin',
    body: `Pengajuan izin Anda ${izin.status}.`,
    data: { event: 'izin_diputuskan', izinId: izin.izinId, status: izin.status },
  });
}
