import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { ScreenShell } from '../../components/screen-shell';
import { EmptyState } from '../../components/ui/empty-state';
import { useTheme } from '../../hooks/use-theme';

export default function AslabDashboardPlaceholderScreen() {
  const theme = useTheme();

  return (
    <ScreenShell>
      <EmptyState
        title="Dashboard Aslab"
        message="Ringkasan laboratorium, jadwal kegiatan, dan keuangan denda sedang disiapkan pada modul SRS-S4-03."
        icon={<Ionicons name="grid-outline" size={28} color={theme.info} />}
      />
    </ScreenShell>
  );
}
