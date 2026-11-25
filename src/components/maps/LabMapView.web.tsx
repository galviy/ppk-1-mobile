import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { LabMapViewProps } from '@/components/maps/lab-map-types';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';

export default function LabMapView({ labs, selectedLabId, onSelectLab }: LabMapViewProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText themeColor="textSecondary" style={styles.info}>
        Peta interaktif hanya tersedia di aplikasi Android/iOS. Berikut daftar laboratorium:
      </ThemedText>
      {labs.length === 0 ? (
        <EmptyState title="Belum ada laboratorium" message="Asisten dapat menambahkan laboratorium di menu Kelola Lab." />
      ) : (
        labs.map((lab) => (
          <Pressable key={lab.id} onPress={() => onSelectLab(lab)} accessibilityRole="button">
            <Card style={[styles.card, lab.id === selectedLabId && styles.selected]}>
              <ThemedText type="smallBold">{lab.nama} ({lab.kode})</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.small}>
                {lab.latitude.toFixed(5)}, {lab.longitude.toFixed(5)} · radius {lab.radiusMeter} m
              </ThemedText>
            </Card>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  info: { fontSize: 13 },
  card: { gap: 4 },
  selected: { borderWidth: 2, borderColor: '#2563EB' },
  small: { fontSize: 13 },
});