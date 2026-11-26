
import React from 'react';

import { ScreenShell } from '@/components/screen-shell';
import LabMapsContent from '@/components/maps/LabMapsContent';
import { useSesiAsisten } from '@/hooks/use-praktikum';

export default function AsistenMapsScreen() {
  return (
    <ScreenShell>
      {() => <Isi />}
    </ScreenShell>
  );
}

function Isi() {
  const sesi = useSesiAsisten();

  return (
    <LabMapsContent
      sesi={sesi.data}
      loadingSesi={sesi.loading}
      errorSesi={sesi.error}
      retrySesi={sesi.retry}
      canManageLabs
    />
  );
}