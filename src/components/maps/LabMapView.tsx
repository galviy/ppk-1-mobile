
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';

import type { Laboratorium } from '@/data/lab-types';
import type { LabMapViewProps } from '@/components/maps/lab-map-types';

export default function LabMapView({
  labs,
  userLocation,
  selectedLabId,
  onSelectLab,
}: LabMapViewProps) {
  const mapRef = useRef<MapView | null>(null);

  // Menentukan titik awal peta.
  const titikAwal = userLocation ?? labs[0] ?? {
    latitude: -2.5,
    longitude: 118,
  };

  const initialRegion: Region = {
    latitude: titikAwal.latitude,
    longitude: titikAwal.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Mencari laboratorium yang sedang dipilih.
  const selectedLab = labs.find((lab) => lab.id === selectedLabId);

  // Mengarahkan peta ke laboratorium yang dipilih.
  useEffect(() => {
    if (!selectedLab || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: selectedLab.latitude,
        longitude: selectedLab.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [selectedLab?.latitude, selectedLab?.longitude]);

  // Mengarahkan peta ke lokasi terbaru pengguna.
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  }, [userLocation?.latitude, userLocation?.longitude]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marker lokasi pengguna */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Lokasi Saya"
            pinColor="blue"
          />
        )}

        {/* Marker dan lingkaran radius setiap laboratorium */}
        {labs.map((lab: Laboratorium) => (
          <React.Fragment key={lab.id}>
            <Circle
              center={{
                latitude: lab.latitude,
                longitude: lab.longitude,
              }}
              radius={lab.radiusMeter}
              strokeColor="rgba(37, 99, 235, 0.8)"
              fillColor="rgba(37, 99, 235, 0.15)"
              strokeWidth={2}
            />

            <Marker
              coordinate={{
                latitude: lab.latitude,
                longitude: lab.longitude,
              }}
              title={`${lab.nama} (${lab.kode})`}
              description={lab.deskripsi}
              pinColor={lab.id === selectedLabId ? 'green' : 'red'}
              onPress={() => onSelectLab(lab)}
            />
          </React.Fragment>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});