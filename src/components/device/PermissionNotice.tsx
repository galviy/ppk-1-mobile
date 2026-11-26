import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  DeviceConditionType,
  getDeviceConditionInfo,
  openDeviceSettings,
} from '@/lib/device-errors';

export type PermissionNoticeKind = DeviceConditionType;
export type PermissionNoticeType = DeviceConditionType;

export interface PermissionNoticeProps {
  /**
   * Jenis kondisi perangkat sesuai kontrak Sprint 3:
   * 'lokasi' | 'notifikasi' | 'gps' | 'lokasi-belum-ada' | 'offline'
   */
  jenis: DeviceConditionType;
  /**
   * Callback saat pengguna menekan tombol "Coba lagi"
   */
  onRetry?: () => void;
  /**
   * Opsional: menimpa judul bawaan
   */
  judul?: string;
  /**
   * Opsional: menimpa pesan bawaan
   */
  pesan?: string;
  /**
   * Opsional: mengatur apakah tombol "Buka Pengaturan" ditampilkan
   * (default mengikuti kondisi: true untuk lokasi, notifikasi, gps)
   */
  showSettingsButton?: boolean;
  /**
   * Opsional: callback kustom untuk membuka pengaturan (default: Linking.openSettings())
   */
  onOpenSettings?: () => void;
  /**
   * Opsional: style tambahan pada container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Komponen pemberitahuan kondisi perangkat dan izin (S3-01.7)
 * Dipakai bersama oleh P1 (notifikasi), P2 (presensi lokasi), dan P3 (peta laboratorium).
 */
export function PermissionNotice({
  jenis,
  onRetry,
  judul,
  pesan,
  showSettingsButton,
  onOpenSettings,
  style,
}: PermissionNoticeProps) {
  const info = getDeviceConditionInfo(jenis);
  const isWarning = info.severity === 'warning';
  const canShowSettings =
    (showSettingsButton ?? info.canOpenSettings) && Platform.OS !== 'web';

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }
    void openDeviceSettings();
  };

  return (
    <View
      style={[
        styles.box,
        isWarning ? styles.warningBox : styles.errorBox,
        style,
      ]}
      accessibilityRole="alert">
      <View style={styles.content}>
        <ThemedText
          type="smallBold"
          style={[
            styles.title,
            isWarning ? styles.warningTitle : styles.errorTitle,
          ]}>
          {judul ?? info.judul}
        </ThemedText>
        <ThemedText
          type="small"
          style={[
            styles.message,
            isWarning ? styles.warningText : styles.errorText,
          ]}>
          {pesan ?? info.pesan}
        </ThemedText>
      </View>

      {(onRetry || canShowSettings) && (
        <View style={styles.actionsRow}>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Coba lagi"
              style={({ pressed }) => [
                styles.actionBtn,
                isWarning ? styles.warningPrimaryBtn : styles.errorPrimaryBtn,
                pressed && styles.btnPressed,
              ]}>
              <Text style={styles.primaryBtnText}>Coba lagi</Text>
            </Pressable>
          )}

          {canShowSettings && (
            <Pressable
              onPress={handleOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Buka Pengaturan"
              style={({ pressed }) => [
                styles.actionBtn,
                styles.settingsBtn,
                isWarning ? styles.warningOutlineBtn : styles.errorOutlineBtn,
                pressed && styles.btnPressed,
              ]}>
              <Text
                style={[
                  styles.outlineBtnText,
                  isWarning ? styles.warningTitle : styles.errorTitle,
                ]}>
                Buka Pengaturan
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default PermissionNotice;

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorTitle: {
    color: '#991B1B',
  },
  errorText: {
    color: '#B91C1C',
  },
  warningTitle: {
    color: '#92400E',
  },
  warningText: {
    color: '#B45309',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorPrimaryBtn: {
    backgroundColor: '#B91C1C',
  },
  warningPrimaryBtn: {
    backgroundColor: '#B45309',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  errorOutlineBtn: {
    borderColor: '#F87171',
  },
  warningOutlineBtn: {
    borderColor: '#F59E0B',
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.75,
  },
});
