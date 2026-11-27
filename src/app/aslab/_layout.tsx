import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useTheme } from '../../hooks/use-theme';

export default function AslabTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.borderSubtle,
        },
        tabBarActiveTintColor: theme.primaryText,
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard Aslab',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="laboratorium"
        options={{
          title: 'Kelola Laboratorium',
          tabBarLabel: 'Lab',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'flask' : 'flask-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="distribusi"
        options={{
          title: 'Distribusi & Transfer',
          tabBarLabel: 'Distribusi',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Peta Laboratorium',
          tabBarLabel: 'Peta',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="kelas"
        options={{
          title: 'Kelas Praktikum',
          tabBarLabel: 'Kelas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'school' : 'school-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* Layar pendukung Aslab (SRS-S4-03): tidak tampil sebagai tab */}
      <Tabs.Screen name="bulk-insert" options={{ href: null }} />
      <Tabs.Screen name="peserta/[kelasId]" options={{ href: null }} />
    </Tabs>
  );
}
