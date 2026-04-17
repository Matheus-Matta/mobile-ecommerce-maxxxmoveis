import "../global.css";
import { useEffect, useRef } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  addNotificationListener,
  addNotificationResponseListener,
} from "@/lib/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().catch(console.warn);

    notificationListener.current = addNotificationListener((notification) => {
      console.log("Notification received:", notification);
    });

    responseListener.current = addNotificationResponseListener((response) => {
      console.log("Notification response:", response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1A1A2E" />
        <Slot />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
