// Modal form generik (tambah/ubah). Menampilkan error validasi/Firestore dan status menyimpan.
// Keyboard: tinggi keyboard dilacak manual (KeyboardAvoidingView tidak andal di Android edge-to-edge),
// sheet naik di atas keyboard, tombol aksi tetap terlihat, dan isinya tetap bisa digulir.
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { PrimaryButton } from './ui/primary-button';
import { Radius } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';

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

// Di Android edge-to-edge + Modal translucent, tinggi keyboard event sering lebih kecil dari tinggi visual keyboard
const ANDROID_KB_COMPENSATION = 48;

function useKeyboardHeight(aktif: boolean) {
  const [tinggi, setTinggi] = useState(0);
  useEffect(() => {
    if (!aktif) {
      setTinggi(0);
      return;
    }
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      const raw = e.endCoordinates?.height ?? 0;
      const adjusted = raw > 0 ? raw + (Platform.OS === 'android' ? ANDROID_KB_COMPENSATION : 0) : 0;
      setTinggi(adjusted);
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setTinggi(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [aktif]);
  return tinggi;
}

export function FormSheet({
  visible,
  title,
  error,
  busy,
  submitLabel = 'Simpan',
  onCancel,
  onSubmit,
  children,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: tinggiLayar } = useWindowDimensions();
  const kb = useKeyboardHeight(visible);

  // Batasi tinggi sheet agar selalu muat di ruang antara status bar/insets atas dan batas atas keyboard
  const ruangTersedia =
    kb > 0
      ? tinggiLayar - kb - insets.top - 16
      : tinggiLayar - insets.top - Math.max(16, insets.bottom) - 16;
  const sheetMaxHeight = Math.max(220, ruangTersedia);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.overlay,
            paddingTop: insets.top + 12,
            paddingBottom: kb > 0 ? kb : Math.max(16, insets.bottom),
          },
        ]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.borderSubtle,
              maxHeight: sheetMaxHeight,
              paddingBottom: 16,
            },
          ]}>
          <ThemedText type="smallBold" style={styles.title}>
            {title}
          </ThemedText>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator
            contentContainerStyle={styles.body}>
            {children}
            {error ? (
              <ThemedText style={[styles.error, { color: theme.dangerText }]}>
                {error}
              </ThemedText>
            ) : null}
          </ScrollView>

          <View style={styles.row}>
            <PrimaryButton
              label="Batal"
              variant="secondary"
              onPress={onCancel}
              disabled={busy}
              style={styles.flex}
            />
            <PrimaryButton
              label={busy ? 'Menyimpan…' : submitLabel}
              onPress={onSubmit}
              disabled={busy}
              style={styles.flex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 10,
  },
  title: {
    fontSize: 17,
  },
  scroll: {
    flexShrink: 1,
  },
  body: {
    gap: 10,
    paddingBottom: 6,
  },
  error: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
  },
  flex: {
    flex: 1,
  },
});