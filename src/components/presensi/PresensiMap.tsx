// Pratinjau peta di halaman presensi: marker lab, lingkaran radius, dan posisi pengguna.
// Memakai react-native-maps (dipasang P1). Di Android perlu Google Maps API key di app.json (P1)
// dan development build; di Expo Go/web peta bisa kosong -> lihat PresensiMap.web.tsx untuk fallback web.
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import type { Koordinat } from '@/lib/geo';

type Props = {
  lab: Koordinat & { radiusMeter: number; nama: string };
  pengguna: Koordinat | null;
};

export default function PresensiMap({ lab, pengguna }: Props) {
  const peta = useRef<MapView>(null);

  // arahkan kamera agar lab (dan posisi pengguna, bila ada) terlihat
  useEffect(() => {
    const titik: Koordinat[] = [lab, ...(pengguna ? [pengguna] : [])];
    peta.current?.fitToCoordinates(titik, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, [lab, pengguna]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={peta}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: lab.latitude,
          longitude: lab.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}>
        <Circle
          center={lab}
          radius={lab.radiusMeter}
          strokeColor="rgba(37,99,235,0.9)"
          fillColor="rgba(37,99,235,0.15)"
        />
        <Marker coordinate={lab} title={lab.nama} description={`Radius ${Math.round(lab.radiusMeter)} m`} />
        {pengguna ? <Marker coordinate={pengguna} title="Posisi Anda" pinColor="green" /> : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 220, borderRadius: 12, overflow: 'hidden' },
});
