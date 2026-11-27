import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLaboratoriumList } from '@/hooks/use-laboratorium';
import { useCurrentLocation } from '@/hooks/use-location';

import type { SesiAktivitas } from '@/lib/lab-activity';
import { getAktivitasLab } from '@/lib/lab-activity';

import LabMapView from '@/components/maps/LabMapView';
import { Href, useRouter } from 'expo-router';

type LabMapsContentProps = {
  sesi: SesiAktivitas[];
  loadingSesi: boolean;
  errorSesi: string | null;
  retrySesi: () => void;
  canManageLabs?: boolean;
};

export default function LabMapsContent({
  sesi,
  loadingSesi,
  errorSesi,
  retrySesi,
  canManageLabs = false,
}: LabMapsContentProps) {
  const router = useRouter();
  // Mengambil data laboratorium dari Firestore.
  const {
    data: labs,
    loading: loadingLabs,
    error: errorLabs,
    retry: retryLabs,
  } = useLaboratoriumList();

  // Mengambil dan memperbarui lokasi pengguna.
  const {
    lokasi,
    statusIzin,
    gpsAktif,
    loading: loadingLokasi,
    error: errorLokasi,
    refresh,
  } = useCurrentLocation({ watch: true });

  // Menyimpan laboratorium yang sedang dipilih.
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // Memilih laboratorium pertama jika belum ada pilihan.
  useEffect(() => {
    if (labs.length === 0) {
      setSelectedLabId(null);
      return;
    }

    const pilihanMasihAda = labs.some(
      (lab) => lab.id === selectedLabId,
    );

    if (!pilihanMasihAda) {
      setSelectedLabId(labs[0].id);
    }
  }, [labs, selectedLabId]);

  // Mendapatkan data laboratorium yang dipilih.
  const selectedLab = labs.find(
    (lab) => lab.id === selectedLabId,
  ) ?? null;

  // Mengambil aktivitas laboratorium yang dipilih.
  const aktivitas = selectedLab
    ? getAktivitasLab(selectedLab.id, sesi)
    : { berlangsung: null, berikutnya: null };

  const userLocation = lokasi
    ? {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
      }
    : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000000' }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: '#FFFFFF' }]}>
        Peta Laboratorium
      </Text>
      <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
        Lihat lokasi laboratorium dan informasi aktivitas praktikum.
      </Text>
      {canManageLabs && (
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/aslab/laboratorium' as Href)}
        >
          <Text style={styles.buttonText}>
            Kelola Laboratorium
          </Text>
        </Pressable>
      )}

      {/* Informasi lokasi pengguna */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lokasi Saya</Text>

        {loadingLokasi ? (
          <ActivityIndicator />
        ) : lokasi ? (
          <Text style={styles.infoText}>
            Lokasi berhasil diperoleh.
          </Text>
        ) : (
          <Text style={styles.errorText}>
            {statusIzin === 'ditolak' ||
            statusIzin === 'ditolak-permanen'
              ? 'Izin lokasi belum diberikan.'
              : gpsAktif === false
                ? 'GPS perangkat tidak aktif.'
                : errorLokasi ?? 'Lokasi belum tersedia.'}
          </Text>
        )}

        <Pressable style={styles.secondaryButton} onPress={refresh}>
          <Text style={styles.buttonText}>Perbarui Lokasi</Text>
        </Pressable>
      </View>

      {/* Status pengambilan data laboratorium */}
      {loadingLabs && <ActivityIndicator />}

      {errorLabs && (
        <View style={styles.card}>
          <Text style={styles.errorText}>{errorLabs}</Text>
          <Pressable style={styles.secondaryButton} onPress={retryLabs}>
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      )}

      {!loadingLabs && !errorLabs && labs.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.infoText}>
            Belum ada data laboratorium.
          </Text>
        </View>
      )}

      {/* Tampilan peta */}
      {!loadingLabs && !errorLabs && labs.length > 0 && (
        <>
          <LabMapView
            labs={labs}
            userLocation={userLocation}
            selectedLabId={selectedLabId}
            onSelectLab={(lab) => setSelectedLabId(lab.id)}
          />

          {/* Daftar laboratorium */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Daftar Laboratorium
            </Text>

            {labs.map((lab) => (
              <Pressable
                key={lab.id}
                style={[
                  styles.labItem,
                  selectedLabId === lab.id && styles.selectedLab,
                ]}
                onPress={() => setSelectedLabId(lab.id)}
              >
                <Text style={styles.labName}>{lab.nama}</Text>
                <Text style={styles.infoText}>
                  Kode: {lab.kode}
                </Text>
                <Text style={styles.infoText}>
                  Radius: {lab.radiusMeter} meter
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Informasi aktivitas laboratorium */}
          {selectedLab && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Aktivitas Laboratorium
              </Text>

              <Text style={styles.labName}>
                {selectedLab.nama} ({selectedLab.kode})
              </Text>

              {loadingSesi ? (
                <ActivityIndicator />
              ) : errorSesi ? (
                <>
                  <Text style={styles.errorText}>{errorSesi}</Text>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={retrySesi}
                  >
                    <Text style={styles.buttonText}>Coba Lagi</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.sectionSubtitle}>
                    Sedang Berlangsung
                  </Text>

                  {aktivitas.berlangsung ? (
                    <AktivitasItem sesi={aktivitas.berlangsung} />
                  ) : (
                    <Text style={styles.infoText}>
                      Tidak ada praktikum yang sedang berlangsung.
                    </Text>
                  )}

                  <Text style={styles.sectionSubtitle}>
                    Aktivitas Berikutnya
                  </Text>

                  {aktivitas.berikutnya ? (
                    <AktivitasItem sesi={aktivitas.berikutnya} />
                  ) : (
                    <Text style={styles.infoText}>
                      Belum ada jadwal praktikum berikutnya.
                    </Text>
                  )}
                </>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// Komponen kecil untuk menampilkan informasi satu sesi.
function AktivitasItem({
  sesi,
}: {
  sesi: SesiAktivitas;
}) {
  return (
    <View style={styles.activityItem}>
      <Text style={styles.labName}>{sesi.namaPraktikum}</Text>
      <Text style={styles.infoText}>
        Tanggal: {sesi.tanggal}
      </Text>
      <Text style={styles.infoText}>
        Waktu: {sesi.jamMulai} - {sesi.jamSelesai}
      </Text>
      <Text style={styles.infoText}>
        Ruang: {sesi.ruang}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    gap: 16,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  labItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 4,
  },
  selectedLab: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  labName: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityItem: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 4,
  },
  secondaryButton: {
    padding: 10,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});