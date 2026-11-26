import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { ScreenShell } from '../../components/screen-shell';
import { EmptyState } from '../../components/ui/empty-state';
import { useTheme } from '../../hooks/use-theme';

export default function AslabDistribusiPlaceholderScreen() {
  const theme = useTheme();

  return (
    <ScreenShell>
      <EmptyState
        title="Distribusi & Transfer Lab"
        message="Fitur penugasan dan pemindahan praktikan maupun asprak antar laboratorium sedang disiapkan pada modul SRS-S4-03."
        icon={<Ionicons name="people-outline" size={28} color={theme.info} />}
      />
    </ScreenShell>
  );
}
