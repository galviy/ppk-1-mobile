/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    success: '#15803D',
    successBg: '#DCFCE7',
    successBorder: '#86EFAC',
    successText: '#166534',
    warning: '#B45309',
    warningBg: '#FEF3C7',
    warningBorder: '#FCD34D',
    warningText: '#92400E',
    danger: '#B91C1C',
    dangerBg: '#FEE2E2',
    dangerBorder: '#FCA5A5',
    dangerText: '#991B1B',
    info: '#1D4ED8',
    infoBg: '#DBEAFE',
    infoBorder: '#93C5FD',
    infoText: '#1E40AF',
    neutral: '#4B5563',
    neutralBg: '#F3F4F6',
    neutralBorder: '#D1D5DB',
    neutralText: '#374151',
    primary: '#1D4ED8',
    onPrimary: '#FFFFFF',
    primaryBg: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    primaryText: '#1E40AF',
    secondary: '#475569',
    secondaryBg: '#F1F5F9',
    secondaryBorder: '#CBD5E1',
    secondaryText: '#1E293B',
    surface: '#FFFFFF',
    border: '#CBD5E1',
    borderSubtle: '#E2E8F0',
    textMuted: '#64748B',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    success: '#4ADE80',
    successBg: '#052E16',
    successBorder: '#166534',
    successText: '#86EFAC',
    warning: '#FBBF24',
    warningBg: '#451A03',
    warningBorder: '#92400E',
    warningText: '#FDE68A',
    danger: '#F87171',
    dangerBg: '#450A0A',
    dangerBorder: '#991B1B',
    dangerText: '#FCA5A5',
    info: '#60A5FA',
    infoBg: '#172554',
    infoBorder: '#1E40AF',
    infoText: '#93C5FD',
    neutral: '#9CA3AF',
    neutralBg: '#1F2937',
    neutralBorder: '#4B5563',
    neutralText: '#E5E7EB',
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    primaryBg: '#172554',
    primaryBorder: '#1E40AF',
    primaryText: '#93C5FD',
    secondary: '#94A3B8',
    secondaryBg: '#272A30',
    secondaryBorder: '#3F444E',
    secondaryText: '#F1F5F9',
    surface: '#16171A',
    border: '#3F444E',
    borderSubtle: '#2E3135',
    textMuted: '#9CA3AF',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type SemanticTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  subtitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
} as const;

export const Elevation = {
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
