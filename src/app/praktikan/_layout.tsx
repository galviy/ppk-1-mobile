import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function PraktikanTabsLayout() {
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
          title: 'Jadwal Sesi',
          tabBarLabel: 'Jadwal',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat Presensi',
          tabBarLabel: 'Riwayat',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📝</Text>,
        }}
      />
    </Tabs>
  );
}
