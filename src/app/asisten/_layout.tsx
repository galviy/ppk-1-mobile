import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function AsistenTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kelola Sesi',
          tabBarLabel: 'Sesi',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="kelas"
        options={{
          title: 'Kelas',
          tabBarLabel: 'Kelas',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏫</Text>,
        }}
      />
      <Tabs.Screen
        name="rekap"
        options={{
          title: 'Rekap Presensi',
          tabBarLabel: 'Rekap',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📊</Text>,
        }}
      />
      {/* layar pendukung (SRS-02): tidak tampil sebagai tab */}
      <Tabs.Screen name="peserta/[kelasId]" options={{ href: null }} />
    </Tabs>
  );
}
