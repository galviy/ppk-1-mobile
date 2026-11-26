
import React from 'react';

import { ScreenShell } from '@/components/screen-shell';
import LabMapsContent from '@/components/maps/LabMapsContent';
import { useJadwalPraktikan } from '@/hooks/use-praktikum';
import type { Profil } from '@/data/models';

export default function PraktikanMapsScreen() {
  return (
    <ScreenShell>
      {(profil: Profil) => <Isi profil={profil} />}
    </ScreenShell>
  );
}

function Isi({ profil }: { profil: Profil }) {
  const jadwal = useJadwalPraktikan(profil.uid);

  return (
    <LabMapsContent
      sesi={jadwal.sesi}
      loadingSesi={jadwal.loading}
      errorSesi={jadwal.error}
      retrySesi={jadwal.retry}
    />
  );
}