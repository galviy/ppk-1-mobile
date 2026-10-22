import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RoleHeader } from '@/components/ui/role-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

export default function AsistenRekapScreen() {
  const { daftarSesi, presensi } = useApp();
  const [selectedSesiId, setSelectedSesiId] = useState<string>(
    daftarSesi[0]?.id ?? ''
  );

  const activeSesi = daftarSesi.find((s) => s.id === selectedSesiId);
  const daftarHadir = presensi[selectedSesiId] || [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Rekap Presensi
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Pilih sesi untuk melihat daftar kehadiran praktikan
            </ThemedText>
          </View>

          {/* Sesi Selector Horizontal List */}
          <View style={styles.selectorWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={daftarSesi}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.selectorList}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedSesiId;
                const hadirCount = presensi[item.id]?.length || 0;

                return (
                  <Pressable
                    onPress={() => setSelectedSesiId(item.id)}
                    style={[
                      styles.selectorItem,
                      isSelected && styles.selectorItemSelected,
                    ]}>
                    <Text
                      style={[
                        styles.selectorItemText,
                        isSelected && styles.selectorItemTextSelected,
                      ]}>
                      Kelas {item.kelas} • Modul {item.id}
                    </Text>
                    <Text
                      style={[
                        styles.selectorBadgeText,
                        isSelected && styles.selectorBadgeTextSelected,
                      ]}>
                      {hadirCount} Hadir
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {activeSesi && (
            <Card style={styles.activeSesiCard}>
              <View style={styles.sesiCardHeader}>
                <View style={styles.sesiHeaderInfo}>
                  <ThemedText type="smallBold" style={styles.sesiTitle}>
                    {activeSesi.namaPraktikum}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.sesiMeta}>
                    Kelas {activeSesi.kelas} • {activeSesi.tanggal} • {activeSesi.jamMulai} -{' '}
                    {activeSesi.jamSelesai}
                  </ThemedText>
                </View>
                <StatusBadge status={activeSesi.status} />
              </View>
            </Card>
          )}

          <ThemedText type="smallBold" style={styles.sectionHeader}>
            Daftar Mahasiswa Hadir ({daftarHadir.length})
          </ThemedText>

          {daftarHadir.length === 0 ? (
            <EmptyState
              title="Belum Ada Yang Hadir"
              message="Belum ada praktikan yang tercatat presensi pada sesi ini."
            />
          ) : (
            <FlatList
              data={daftarHadir}
              keyExtractor={(item, index) => `${item.praktikanId}-${index}`}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <Card style={styles.hadirCard}>
                  <View style={styles.hadirRow}>
                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.hadirInfo}>
                      <ThemedText type="smallBold" style={styles.hadirName}>
                        {item.nama}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.hadirMeta}>
                        ID: {item.praktikanId} • Kelas {item.kelas}
                      </ThemedText>
                    </View>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>
                        Pukul {item.waktu}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  titleSection: {
    paddingVertical: Spacing.three,
  },
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  selectorWrapper: {
    marginBottom: Spacing.three,
  },
  selectorList: {
    gap: 8,
  },
  selectorItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    gap: 2,
  },
  selectorItemSelected: {
    backgroundColor: '#2563EB',
  },
  selectorItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  selectorItemTextSelected: {
    color: '#FFFFFF',
  },
  selectorBadgeText: {
    fontSize: 11,
    color: '#64748B',
  },
  selectorBadgeTextSelected: {
    color: '#DBEAFE',
  },
  activeSesiCard: {
    marginBottom: 12,
    padding: 14,
  },
  sesiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  sesiHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  sesiTitle: {
    fontSize: 15,
  },
  sesiMeta: {
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 15,
    marginVertical: 8,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  hadirCard: {
    marginVertical: 4,
    padding: 12,
  },
  hadirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  hadirInfo: {
    flex: 1,
  },
  hadirName: {
    fontSize: 14,
  },
  hadirMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  timeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
  },
});
