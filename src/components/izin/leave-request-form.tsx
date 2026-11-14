import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SentimentResultBox } from '@/components/izin/sentiment-result-box';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { InputIzin } from '@/data/izin-types';
import type { Sesi } from '@/data/models';
import { useTheme } from '@/hooks/use-theme';
import { tanggalDariIso } from '@/lib/format';
import {
  checkSessionLeaveEligibility,
  REASON_MAX_LENGTH,
  validateReason,
} from '@/lib/leave-rules';
import { analyzeReason } from '@/services/sentiment-service';

type Props = {
  sessions: Sesi[];
  namaKelasMap?: Record<string, string>;
  sudahPresensiIds?: ReadonlySet<string>;
  sudahIzinIds?: ReadonlySet<string>;
  initialSesiId?: string | null;
  submitting?: boolean;
  onSubmit: (value: InputIzin) => void | Promise<void>;
};

type Errors = { session?: string; reason?: string };

export function LeaveRequestForm({
  sessions,
  namaKelasMap = {},
  sudahPresensiIds,
  sudahIzinIds,
  initialSesiId = null,
  submitting = false,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const [sesiId, setSesiId] = useState<string | null>(initialSesiId);
  const [alasan, setAlasan] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const disabled = submitting || busy;

  const previewSentiment = useMemo(() => {
    if (!alasan.trim()) return null;
    return analyzeReason(alasan);
  }, [alasan]);

  const handleSubmit = async () => {
    if (disabled) return;

    const selectedSesi = sessions.find((s) => s.id === sesiId);
    const eligibility = selectedSesi
      ? checkSessionLeaveEligibility(selectedSesi, {
          sudahPresensi: sudahPresensiIds?.has(selectedSesi.id),
          sudahIzin: sudahIzinIds?.has(selectedSesi.id),
        })
      : { eligible: false, reason: 'Pilih sesi terlebih dahulu.' };

    const validation = validateReason(alasan);
    const next: Errors = {};
    if (!sesiId || !selectedSesi) {
      next.session = 'Pilih sesi terlebih dahulu.';
    } else if (!eligibility.eligible) {
      next.session = eligibility.reason ?? 'Sesi ini tidak dapat diajukan izin.';
    }
    if (!validation.valid) next.reason = validation.error;
    setErrors(next);
    if (next.session || !sesiId || !validation.valid) return;

    setBusy(true);
    try {
      await onSubmit({ sesiId, alasan: validation.value });
    } finally {
      setBusy(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Belum ada sesi"
        message="Tidak ada sesi yang bisa diajukan izin saat ini."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Pilih sesi</Text>
      {sessions.map((s) => {
        const check = checkSessionLeaveEligibility(s, {
          sudahPresensi: sudahPresensiIds?.has(s.id),
          sudahIzin: sudahIzinIds?.has(s.id),
        });
        const namaKelas = namaKelasMap[s.kelasId] ?? 'Kelas';
        const isSelected = s.id === sesiId;

        return (
          <Card
            key={s.id}
            selected={isSelected}
            style={!check.eligible && styles.disabledCard}
            onPress={
              check.eligible && !disabled
                ? () => {
                    setSesiId(s.id);
                    setErrors((e) => ({ ...e, session: undefined }));
                  }
                : undefined
            }>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: theme.text }]}>{s.namaPraktikum}</Text>
              {!check.eligible && check.reason ? (
                <Text style={styles.ineligibleBadge}>{check.reason}</Text>
              ) : null}
            </View>
            <Text style={[styles.sessionMeta, { color: theme.textSecondary }]}>
              {namaKelas} • {tanggalDariIso(s.tanggal)} • {s.jamMulai}–{s.jamSelesai}
            </Text>
          </Card>
        );
      })}
      {errors.session ? <Text style={styles.error}>{errors.session}</Text> : null}

      <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>Alasan ketidakhadiran</Text>
      <TextInput
        value={alasan}
        onChangeText={(t) => {
          setAlasan(t);
          if (errors.reason) setErrors((e) => ({ ...e, reason: undefined }));
        }}
        placeholder="Contoh: Saya sedang sakit demam dan perlu istirahat"
        placeholderTextColor={theme.textSecondary}
        multiline
        maxLength={REASON_MAX_LENGTH}
        editable={!disabled}
        textAlignVertical="top"
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: errors.reason ? '#DC2626' : 'transparent',
          },
        ]}
      />
      <View style={styles.inputFooter}>
        {errors.reason ? <Text style={styles.error}>{errors.reason}</Text> : <View />}
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          {alasan.length}/{REASON_MAX_LENGTH}
        </Text>
      </View>

      <View style={styles.sentimentWrap}>
        <SentimentResultBox sentiment={previewSentiment} />
      </View>

      <PrimaryButton
        label={disabled ? 'Mengirim…' : 'Kirim Pengajuan'}
        onPress={() => void handleSubmit()}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sessionTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  sessionMeta: { fontSize: 12, marginTop: 2 },
  disabledCard: { opacity: 0.55 },
  ineligibleBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  input: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentWrap: {
    marginBottom: 12,
  },
  counter: { fontSize: 11 },
  error: { color: '#DC2626', fontSize: 12 },
});
