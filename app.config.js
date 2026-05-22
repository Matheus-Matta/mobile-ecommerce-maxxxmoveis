const fs = require("fs");

const IS_PROD = process.env.APP_ENV === "production";
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ||
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  "e78b1455-d8d0-41a7-b9e3-16b6a67abff4";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "";
const WEBVIEW_URL =
  process.env.EXPO_PUBLIC_SITE_URL || "https://maxxxmoveis.com.br";
const HAS_GOOGLE_SERVICES = fs.existsSync("./google-services.json");

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Maxxx Móveis",
  slug: "maxxx-moveis-app",
  version: "1.0.0",
  runtimeVersion: {
    policy: "sdkVersion",
  },
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "maxxxmoveis",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0058BB",
  },
  androidStatusBar: {
    barStyle: "light-content",
    backgroundColor: "#0058BB",
    translucent: false,
  },
  androidNavigationBar: {
    barStyle: "dark-content",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "br.com.maxxxmoveis.app",
    infoPlist: {
      NSCameraUsageDescription: "Usamos a câmera para fotos do perfil.",
      NSPhotoLibraryUsageDescription:
        "Acesso à galeria para upload de imagens.",
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    package: "br.com.maxxxmoveis.app",
    versionCode: 1,
    ...(HAS_GOOGLE_SERVICES
      ? { googleServicesFile: "./google-services.json" }
      : {}),
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0058BB",
    },
    edgeToEdgeEnabled: false,
    predictiveBackGestureEnabled: false,
    permissions: ["POST_NOTIFICATIONS", "RECEIVE_BOOT_COMPLETED", "VIBRATE"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#0058BB",
        defaultChannel: "maxxx-moveis-default",
      },
    ],
    [
      "expo-secure-store",
      {
        faceIDPermission: "Permitir autenticação biométrica.",
      },
    ],
  ],
  extra: {
    apiUrl: API_URL,
    webviewUrl: WEBVIEW_URL,
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    appEnv: IS_PROD ? "production" : "development",
  },
};

module.exports = config;
