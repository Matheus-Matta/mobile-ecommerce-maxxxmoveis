import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
  WebViewMessageEvent,
  WebViewNavigation,
  WebViewProps,
} from "react-native-webview";

import { APP_CONFIG } from "../constants";
import { saveDeviceTokenToBackend } from "../services/pushNotifications";
import { LoadingScreen } from "./LoadingScreen";

type WebViewScreenProps = {
  pushToken: string | null;
  isConnected: boolean;
  pendingNotificationUrl: string | null;
  onNotificationUrlHandled: () => void;
};

type WebViewMessage =
  | { type: "USER_LOGGED"; userId: number; email: string }
  | { type: "USER_LOGOUT" }
  | { type: "PAGE_READY" }
  | { type: "OPEN_EXTERNAL"; url: string };

const OPEN_BLANK_TARGETS_EXTERNALLY_SCRIPT = `
  (function () {
    function openOutsideApp(url) {
      if (!url || !window.ReactNativeWebView) return null;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OPEN_EXTERNAL", url: url })
      );
      return null;
    }

    window.open = function (url) {
      return openOutsideApp(url);
    };

    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        var link = target && target.closest ? target.closest("a[href]") : null;

        if (!link) return;

        var href = link.getAttribute("href");
        var linkTarget = link.getAttribute("target");

        if (linkTarget && linkTarget.toLowerCase() !== "_self") {
          event.preventDefault();
          openOutsideApp(link.href || href);
        }
      },
      true
    );
  })();
  true;
`;

function isAllowedOrigin(url: string): boolean {
  return APP_CONFIG.ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
}

function isInternalNavigationUrl(url: string): boolean {
  return url === "about:blank" || isAllowedOrigin(url);
}

function canOpenOutsideApp(url: string): boolean {
  return /^(https?:\/\/|tel:|mailto:|sms:|whatsapp:\/\/|geo:|maps:)/i.test(url);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWebViewMessage(value: unknown): value is WebViewMessage {
  if (!isRecord(value) || typeof value.type !== "string") return false;

  if (value.type === "PAGE_READY" || value.type === "USER_LOGOUT") {
    return true;
  }

  if (value.type === "OPEN_EXTERNAL") {
    return typeof value.url === "string" && value.url.length > 0;
  }

  return (
    value.type === "USER_LOGGED" &&
    typeof value.userId === "number" &&
    Number.isFinite(value.userId) &&
    typeof value.email === "string" &&
    value.email.length <= 254
  );
}

function parseWebViewMessage(data: string): WebViewMessage | null {
  try {
    const parsed: unknown = JSON.parse(data);
    return isWebViewMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function WebViewScreen({
  pushToken,
  isConnected,
  pendingNotificationUrl,
  onNotificationUrlHandled,
}: WebViewScreenProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const tokenSentRef = useRef(false);
  const registeredDeviceTokenRef = useRef<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasWebViewError, setHasWebViewError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(APP_CONFIG.SITE_URL);
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

  const webNavigationWhitelist = useMemo(
    () => ["https://*", "http://*", "about:blank"],
    []
  );
  const bottomSafeAreaHeight = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 0
  );

  const openOutsideApp = useCallback((url: string) => {
    if (!canOpenOutsideApp(url)) {
      if (__DEV__) {
        console.warn("[WebView] URL externa bloqueada:", url);
      }
      return;
    }

    Linking.openURL(url).catch((error: unknown) => {
      if (__DEV__) {
        console.warn("[WebView] Não foi possível abrir fora do app:", url, error);
      }
    });
  }, []);

  const sendPushTokenToWebView = useCallback(() => {
    if (!pushToken || tokenSentRef.current) return;

    tokenSentRef.current = true;
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "PUSH_TOKEN",
        token: pushToken,
        platform: Platform.OS,
      })
    );
  }, [pushToken]);

  const registerDeviceToken = useCallback(
    async (userId: number) => {
      if (!APP_CONFIG.API_URL || !pushToken) return;

      const registrationKey = `${userId}:${pushToken}`;
      if (registeredDeviceTokenRef.current === registrationKey) return;

      try {
        await saveDeviceTokenToBackend({
          userId,
          token: pushToken,
          platform: Platform.OS,
        });
        registeredDeviceTokenRef.current = registrationKey;
      } catch (error: unknown) {
        if (__DEV__) {
          console.warn("[Push] Falha ao salvar token no backend:", error);
        }
      }
    },
    [pushToken]
  );

  useEffect(() => {
    if (isConnected && hasWebViewError) {
      setHasWebViewError(false);
      webViewRef.current?.reload();
    }
  }, [hasWebViewError, isConnected]);

  useEffect(() => {
    if (!loggedUserId) return;

    void registerDeviceToken(loggedUserId);
  }, [loggedUserId, registerDeviceToken]);

  useEffect(() => {
    if (!pendingNotificationUrl) return;

    if (isInternalNavigationUrl(pendingNotificationUrl)) {
      setCurrentUrl(pendingNotificationUrl);
    } else {
      openOutsideApp(pendingNotificationUrl);
    }

    onNotificationUrlHandled();
  }, [onNotificationUrlHandled, openOutsideApp, pendingNotificationUrl]);

  useEffect(() => {
    const backAction = () => {
      if (!canGoBack) return false;

      webViewRef.current?.goBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  const handleShouldStartLoadWithRequest = useCallback<
    NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>
  >(
    (request) => {
      const { url } = request;

      if (!isInternalNavigationUrl(url)) {
        openOutsideApp(url);
        return false;
      }

      return true;
    },
    [openOutsideApp]
  );

  const handleOpenWindow = useCallback<
    NonNullable<WebViewProps["onOpenWindow"]>
  >(
    (event) => {
      openOutsideApp(event.nativeEvent.targetUrl);
    },
    [openOutsideApp]
  );

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (!isAllowedOrigin(event.nativeEvent.url)) {
        if (__DEV__) {
          console.warn(
            "[WebView] Mensagem de origem não autorizada:",
            event.nativeEvent.url
          );
        }
        return;
      }

      const parsed = parseWebViewMessage(event.nativeEvent.data);
      if (!parsed) {
        if (__DEV__) {
          console.warn("[WebView] Mensagem inválida recebida.");
        }
        return;
      }

      switch (parsed.type) {
        case "PAGE_READY":
          sendPushTokenToWebView();
          break;
        case "OPEN_EXTERNAL":
          openOutsideApp(parsed.url);
          break;
        case "USER_LOGGED":
          setLoggedUserId(parsed.userId);
          if (__DEV__) {
            console.info("[App] Login recebido da WebView.");
          }
          break;
        case "USER_LOGOUT":
          tokenSentRef.current = false;
          registeredDeviceTokenRef.current = null;
          setLoggedUserId(null);
          if (__DEV__) {
            console.info("[App] Logout recebido da WebView.");
          }
          break;
      }
    },
    [openOutsideApp, registerDeviceToken, sendPushTokenToWebView]
  );

  const handleLoadEnd = useCallback(() => {
    sendPushTokenToWebView();
  }, [sendPushTokenToWebView]);

  const handleRetry = useCallback(() => {
    setHasWebViewError(false);
    tokenSentRef.current = false;
    webViewRef.current?.reload();
  }, []);

  if (Platform.OS === "web") {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        {React.createElement("iframe", {
          src: currentUrl,
          title: "Maxxx Móveis",
          style: {
            flex: 1,
            width: "100%",
            height: "100%",
            border: 0,
            backgroundColor: "#ffffff",
          },
        })}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {hasWebViewError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Erro ao carregar a página.</Text>
          <TouchableOpacity
            accessibilityLabel="Recarregar página"
            accessibilityRole="button"
            onPress={handleRetry}
          >
            <Text style={styles.errorBannerLink}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        javaScriptEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        domStorageEnabled
        cacheEnabled
        cacheMode="LOAD_DEFAULT"
        setSupportMultipleWindows={false}
        originWhitelist={webNavigationWhitelist}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled={false}
        allowsBackForwardNavigationGestures
        injectedJavaScriptBeforeContentLoaded={
          OPEN_BLANK_TARGETS_EXTERNALLY_SCRIPT
        }
        injectedJavaScript={OPEN_BLANK_TARGETS_EXTERNALLY_SCRIPT}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onOpenWindow={handleOpenWindow}
        onMessage={handleWebViewMessage}
        onLoadEnd={handleLoadEnd}
        onError={() => setHasWebViewError(true)}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 500) {
            setHasWebViewError(true);
          }
        }}
        startInLoadingState
        renderLoading={() => <LoadingScreen />}
      />

      <View
        pointerEvents="none"
        style={[styles.bottomSafeArea, { height: bottomSafeAreaHeight }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0058BB",
  },
  webview: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: "#ffffff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF3CD",
    padding: 8,
  },
  errorBannerText: {
    color: "#856404",
    fontSize: 13,
  },
  errorBannerLink: {
    color: "#0058BB",
    fontSize: 13,
    fontWeight: "700",
  },
});
