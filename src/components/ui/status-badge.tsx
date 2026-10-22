import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Sesi } from '@/data/types';

interface StatusBadgeProps {
  status: Sesi['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let label = 'Belum Dibuka';
  let badgeStyle = styles.belumDibuka;
  let textStyle = styles.textBelumDibuka;

  if (status === 'dibuka') {
    label = 'Dibuka';
    badgeStyle = styles.dibuka;
    textStyle = styles.textDibuka;
  } else if (status === 'ditutup') {
    label = 'Ditutup';
    badgeStyle = styles.ditutup;
    textStyle = styles.textDitutup;
  }

  return (
    <View style={[styles.badge, badgeStyle]}>
      <View style={[styles.dot, { backgroundColor: textStyle.color }]} />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  dibuka: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  textDibuka: {
    color: '#15803D',
  },
  belumDibuka: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  textBelumDibuka: {
    color: '#B45309',
  },
  ditutup: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  textDitutup: {
    color: '#4B5563',
  },
});
