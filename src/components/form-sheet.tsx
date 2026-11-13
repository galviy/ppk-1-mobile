// Modal form generik (tambah/ubah). Menampilkan error validasi/Firestore dan status menyimpan.
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  title: string;
  error?: string | null;
  busy?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
};

export function FormSheet({
  visible, title, error, busy, submitLabel = 'Simpan', onCancel, onSubmit, children,
}: Props) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" style={styles.title}>
            {title}
          </ThemedText>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            {children}
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          </ScrollView>
          <View style={styles.row}>
            <PrimaryButton label="Batal" variant="secondary" onPress={onCancel} disabled={busy} style={styles.flex} />
            <PrimaryButton
              label={busy ? 'Menyimpan…' : submitLabel}
              onPress={onSubmit}
              disabled={busy}
              style={styles.flex}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
  title: { fontSize: 17 },
  body: { gap: 12, paddingBottom: 4 },
  error: { color: '#DC2626', fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
