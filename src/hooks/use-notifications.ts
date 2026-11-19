import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Href, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { useAuth } from '@/context/AuthContext';
import { DeviceConditionType } from '@/lib/device-errors';
import {
  configureForegroundNotifications,
  extractNotificationData,
  PushRegistrationStatus,
  resolveNotificationRoute,
  syncUserPushToken,
} from '@/services/notifications';

export interface UseNotificationsResult {
  pushToken: string | null;
  status: PushRegistrationStatus | 'idle';
  condition: DeviceConditionType | null;
  errorMessage: string | null;
  loading: boolean;
  lastNotification: Notifications.Notification | null;
  retryRegistration: () => Promise<void>;
}

/**
 * Hook pengelolaan push notification sisi klien (S3-01.3, S3-01.4, S3-01.5):
 * - Meminta izin notifikasi & menyimpan Expo push token ke users/{uid} setelah login
 * - Memperbarui token bila berubah atau saat pengguna kembali dari pengaturan perangkat
 * - Menampilkan banner saat notifikasi diterima di foreground
 * - Membuka rute sesuai payload saat notifikasi diketuk (foreground, background, maupun cold start)
 */
export function useNotifications(): UseNotificationsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const uid = user?.uid ?? null;
  const savedPushToken = user?.expoPushToken ?? null;

  const router = useRouter();
  const segments = useSegments();

  const [pushToken, setPushToken] = useState<string | null>(savedPushToken);
  const [status, setStatus] = useState<PushRegistrationStatus | 'idle'>('idle');
  const [condition, setCondition] = useState<DeviceConditionType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const handledResponseIdsRef = useRef<Set<string>>(new Set());
  const syncingRef = useRef<boolean>(false);

  useEffect(() => {
    configureForegroundNotifications();
  }, []);

  const performSync = useCallback(
    async (targetUid: string, currentSavedToken?: string | null) => {
      if (Platform.OS === 'web' || syncingRef.current) {
        return;
      }

      syncingRef.current = true;
      setLoading(true);
      try {
        const result = await syncUserPushToken(targetUid, currentSavedToken);
        setStatus(result.status);
        setCondition(result.condition);
        setErrorMessage(result.message ?? null);
        if (result.token) {
          setPushToken(result.token);
        }
      } finally {
        syncingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  const retryRegistration = useCallback(async () => {
    if (!uid) return;
    await performSync(uid, undefined);
  }, [uid, performSync]);

  // S3-01.3 & S3-01.4: Sinkronisasi token setelah pengguna login
  useEffect(() => {
    if (isAuthLoading || !uid) {
      return;
    }

    void performSync(uid, savedPushToken);
  }, [uid, savedPushToken, isAuthLoading, performSync]);

  // S3-01.4: Pantau perubahan push token dari layanan sistem & saat kembali dari pengaturan perangkat
  useEffect(() => {
    if (Platform.OS === 'web' || !uid) {
      return;
    }

    const tokenSubscription = Notifications.addPushTokenListener(() => {
      void performSync(uid, undefined);
    });

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && uid) {
        void performSync(uid, pushToken);
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      tokenSubscription.remove();
      appStateSubscription.remove();
    };
  }, [uid, pushToken, performSync]);

  // Helper untuk memproses NotificationResponse yang diketuk pengguna
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse | null | undefined) => {
      if (!response) return;

      const actionId = response.actionIdentifier;
      if (
        actionId &&
        actionId !== Notifications.DEFAULT_ACTION_IDENTIFIER
      ) {
        return;
      }

      const id = response.notification?.request?.identifier;
      if (id && handledResponseIdsRef.current.has(id)) {
        return;
      }

      const data = extractNotificationData(response);
      const targetRoute = resolveNotificationRoute(data);

      if (id) {
        handledResponseIdsRef.current.add(id);
      }

      if (targetRoute) {
        setPendingRoute(targetRoute);
      }

      try {
        Notifications.clearLastNotificationResponse();
      } catch {
        // Abaikan bila platform tidak mendukung clearLastNotificationResponse
      }
    },
    []
  );

  // S3-01.5: Listener notifikasi foreground & interaksi ketukan notifikasi (termasuk cold start)
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    // Periksa apakah aplikasi dibuka dari kondisi mati (cold start) lewat ketukan notifikasi
    const initTimer = setTimeout(() => {
      try {
        const initialResponse = Notifications.getLastNotificationResponse();
        if (initialResponse) {
          handleNotificationResponse(initialResponse);
        }
      } catch (err) {
        console.warn('Gagal memeriksa last notification response:', err);
      }
    }, 0);

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        setLastNotification(notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    return () => {
      clearTimeout(initTimer);
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [handleNotificationResponse]);

  // Eksekusi navigasi ke pendingRoute setelah pengguna terautentikasi dan berada di luar layar splash/auth
  useEffect(() => {
    if (!pendingRoute || isAuthLoading || !user) {
      return;
    }

    const firstSegment = segments[0] as string | undefined;
    const isInitialOrAuth =
      !firstSegment ||
      firstSegment === 'index' ||
      firstSegment === '(auth)' ||
      firstSegment === 'pilih-identitas';

    if (isInitialOrAuth) {
      return;
    }

    const routeToOpen = pendingRoute;
    const timer = setTimeout(() => {
      setPendingRoute((current) => (current === routeToOpen ? null : current));
      router.push(routeToOpen as Href);
    }, 50);

    return () => clearTimeout(timer);
  }, [pendingRoute, isAuthLoading, user, segments, router]);

  return {
    pushToken: uid ? (pushToken ?? savedPushToken) : null,
    status: uid ? status : 'idle',
    condition: uid ? condition : null,
    errorMessage: uid ? errorMessage : null,
    loading,
    lastNotification,
    retryRegistration,
  };
}
