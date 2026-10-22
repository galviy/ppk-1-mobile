import { router } from 'expo-router';
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

type FilterKelas = 'Semua' | 'A' | 'B';

export default function AsistenSesiScreen() {
  const { daftarSesi, setSesiStatus } = useApp();
  const [filter, setFilter] = useState<FilterKelas>('Semua');

  const filteredSesi = daftarSesi.filter((s) => {
    if (filter === 'Semua') return true;
    return s.kelas === filter;
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Kelola Sesi Praktikum
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Pantau dan kelola status sesi untuk seluruh kelas praktikum
            </ThemedText>
          </View>

          {/* Filter Chips: Semua | Kelas A | Kelas B */}
          <View style={styles.filterRow}>
            {(['Semua', 'A', 'B'] as FilterKelas[]).map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterChip, active && styles.filterChipActive]}>
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}>
                    {f === 'Semua' ? 'Semua Kelas' : `Kelas ${f}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredSesi.length === 0 ? (
            <EmptyState
              title="Belum Ada Sesi"
              message={`Tidak ada sesi yang terdaftar untuk filter ${filter}.`}
            />
          ) : (
            <FlatList
              data={filteredSesi}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card
                  style={styles.sessionCard}
                  onPress={() =>
                    router.push({ pathname: '/sesi/[id]', params: { id: item.id } })
                  }>
                  <View style={styles.cardTopRow}>
                    <View style={styles.titleWrapper}>
                      <ThemedText type="smallBold" style={styles.sessionTitle}>
                        {item.namaPraktikum}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.sessionInfo}>
                        Kelas {item.kelas} • {item.tanggal}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.sessionTime}>
                        ⏰ {item.jamMulai} - {item.jamSelesai} WIB
                      </ThemedText>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  {/* Sesi status toggle helper untuk pengujian fondasi */}
                  <View style={styles.actionRow}>
                    <Text style={styles.actionNote}>Ubah status uji:</Text>
                    <Pressable
                      onPress={() =>
                        setSesiStatus(
                          item.id,
                          item.status === 'dibuka' ? 'ditutup' : 'dibuka'
                        )
                      }
                      style={styles.toggleBtn}>
                      <Text style={styles.toggleBtnText}>
                        {item.status === 'dibuka' ? 'Tutup Sesi' : 'Buka Sesi'}
                      </Text>
                    </Pressable>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.three,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  sessionCard: {
    marginVertical: 6,
    padding: 16,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrapper: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    fontSize: 16,
  },
  sessionInfo: {
    fontSize: 13,
  },
  sessionTime: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    gap: 8,
  },
  actionNote: {
    fontSize: 11,
    color: '#94A3B8',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  toggleBtnText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
});