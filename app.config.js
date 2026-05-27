const fs = require("fs");

const IS_PROD = process.env.APP_ENV === "production";
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ||
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  "e78b1455-d8d0-41a7-b9e3-16b6a67abff4";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "";
const WEBVIEW_URL =
  process.env.EXPO_PUBLIC_SITE_URL || "https://maxxxmoveis.com.br";
const GOOGLE_SERVICES_ANDROID =
  process.env.GOOGLE_SERVICES_JSON && fs.existsSync(process.env.GOOGLE_SERVICES_JSON)
    ? process.env.GOOGLE_SERVICES_JSON
    : fs.existsSync("./google-services.json")
    ? "./google-services.json"
    : null;

const GOOGLE_SERVICES_IOS =
  process.env.GOOGLE_SERVICES_PLIST && fs.existsSync(process.env.GOOGLE_SERVICES_PLIST)
    ? process.env.GOOGLE_SERVICES_PLIST
    : fs.existsSync("./GoogleService-Info.plist")
    ? "./GoogleService-Info.plist"
    : null;

const ICON = "./assets/icon.png";
const ADAPTIVE_ICON = "./assets/adaptive-icon.png";
const NOTIFICATION_ICON = "./assets/notification-icon.png";

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Maxxx Móveis",
  slug: "maxxx-moveis-app",
  version: "1.0.0",
  runtimeVersion: {
    policy: "sdkVersion",
  },
  orientation: "portrait",
  icon: ICON,
  scheme: "maxxxmoveis",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: ICON,
    resizeMode: "contain",
    backgroundColor: "#ffffff",
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
    ...(GOOGLE_SERVICES_IOS ? { googleServicesFile: GOOGLE_SERVICES_IOS } : {}),
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
    ...(GOOGLE_SERVICES_ANDROID ? { googleServicesFile: GOOGLE_SERVICES_ANDROID } : {}),
    adaptiveIcon: {
      foregroundImage: ADAPTIVE_ICON,
      backgroundColor: "#0058BB",
    },
    edgeToEdgeEnabled: false,
    predictiveBackGestureEnabled: false,
    permissions: ["POST_NOTIFICATIONS", "RECEIVE_BOOT_COMPLETED", "VIBRATE"],
  },
  web: {
    favicon: ICON,
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: NOTIFICATION_ICON,
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
