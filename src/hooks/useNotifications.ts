import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

import {
  canUseNativeNotifications,
  configureNotificationHandler,
  getOrRegisterPushToken,
  testLocalNotification,
} from "../services/pushNotifications";

type NotificationUrlHandler = (url: string) => void;

configureNotificationHandler();

function getNotificationUrl(response: Notifications.NotificationResponse) {
  const url = response.notification.request.content.data?.url;
  return typeof url === "string" ? url : null;
}

export function useNotifications(onNotificationUrl?: NotificationUrlHandler) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const didScheduleDevNotification = useRef(false);

  useEffect(() => {
    if (!canUseNativeNotifications()) {
      if (__DEV__) {
        console.info(
          "[Push] Push remoto desativado no Expo Go/web. Use development build."
        );
      }
      return;
    }

    let isMounted = true;

    getOrRegisterPushToken()
      .then(async (token) => {
        if (!isMounted) return;
        if (token) setPushToken(token);

        if (__DEV__ && !didScheduleDevNotification.current) {
          didScheduleDevNotification.current = true;
          await testLocalNotification();
        }
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.warn("[Push] Falha ao configurar notificações:", error);
        }
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (__DEV__) {
          console.info(
            "[Push] Notificação recebida:",
            notification.request.identifier
          );
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const url = getNotificationUrl(response);
        if (url) onNotificationUrl?.(url);
      });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onNotificationUrl]);

  return { pushToken };
}
