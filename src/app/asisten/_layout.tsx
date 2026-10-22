import { Tabs } from 'expo-router';

export default function AsistenLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0f5c4d' }}>
      <Tabs.Screen name="index" options={{ title: 'Kelola Sesi' }} />
      <Tabs.Screen name="rekap" options={{ title: 'Rekap' }} />
    </Tabs>
  );
}