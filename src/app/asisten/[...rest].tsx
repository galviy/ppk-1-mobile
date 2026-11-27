import { Href, Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { resolveLegacyAsistenRedirect } from '../../lib/role-routing';

export default function LegacyAsistenCatchAllRedirect() {
  const { rest, sesiId } = useLocalSearchParams<{
    rest?: string | string[];
    sesiId?: string;
  }>();

  const target = resolveLegacyAsistenRedirect(rest);
  if (target === '/asprak/rekap' && typeof sesiId === 'string' && sesiId) {
    return (
      <Redirect
        href={`/asprak/rekap?sesiId=${encodeURIComponent(sesiId)}` as Href}
      />
    );
  }

  return <Redirect href={target as Href} />;
}
