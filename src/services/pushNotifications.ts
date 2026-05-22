import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { APP_CONFIG } from "../constants";

export function isRunningInExpoGo() {
  return Constants.appOwnership === "expo";
}

export function canUseNativeNotifications() {
  return Platform.OS !== "web" && !isRunningInExpoGo();
}

export function configureNotificationHandler() {
  if (!canUseNativeNotifications()) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export function getProjectId() {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return typeof projectId === "string" && projectId.length > 0
    ? projectId
    : null;
}

export async function configureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(
    APP_CONFIG.NOTIFICATION_CHANNEL_ID,
    {
      name: "Notificações Maxxx",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0058BB",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    }
  );
}

export async function getOrRegisterPushToken(): Promise<string | null> {
  if (!canUseNativeNotifications()) {
    if (__DEV__ && isRunningInExpoGo()) {
      console.info(
        "[Push] Expo Go não suporta push remoto. Use development build."
      );
    }
    return null;
  }

  if (!Device.isDevice) {
    if (__DEV__) {
      console.info("[Push] Use um aparelho físico para gerar push token.");
    }
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (finalStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  await configureAndroidNotificationChannel();

  const storedToken = await SecureStore.getItemAsync(
    APP_CONFIG.PUSH_TOKEN_STORAGE_KEY
  );
  if (storedToken) return storedToken;

  const projectId = getProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn("[Push] EAS projectId não configurado.");
    }
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await SecureStore.setItemAsync(
    APP_CONFIG.PUSH_TOKEN_STORAGE_KEY,
    tokenResponse.data
  );

  return tokenResponse.data;
}

export async function saveDeviceTokenToBackend(params: {
  userId: number | string;
  token: string;
  platform?: string;
}) {
  if (!APP_CONFIG.API_URL) return { skipped: true };

  const response = await fetch(
    `${APP_CONFIG.API_URL.replace(/\/$/, "")}/api/device-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId,
        token: params.token,
        platform: params.platform ?? Platform.OS,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Falha ao salvar token no backend: HTTP ${response.status}`);
  }

  return response.json();
}

export async function registerForPushNotificationsAsync(
  userId?: number | string
) {
  const token = await getOrRegisterPushToken();

  if (token && userId) {
    await saveDeviceTokenToBackend({ userId, token });
  }

  return token;
}

export async function testLocalNotification() {
  if (!canUseNativeNotifications()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Maxxx Móveis",
      body: "Teste de notificação local no app.",
      sound: "default",
      data: {
        url: APP_CONFIG.SITE_URL,
        type: "aviso_geral",
      },
    },
    trigger: null,
  });
}
