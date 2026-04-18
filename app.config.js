const IS_PROD = process.env.APP_ENV === "production";

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Maxxx Móveis",
  slug: "maxxxmoveis",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  scheme: "maxxxmoveis",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1A1A2E",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.maxxxmoveis.app",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1A1A2E",
    },
    package: "com.maxxxmoveis.app",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ["NOTIFICATIONS", "VIBRATE", "RECEIVE_BOOT_COMPLETED"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    // Plugin de notificações ativo apenas em produção (EAS build)
    ...(IS_PROD
      ? [
          [
            "expo-notifications",
            {
              icon: "./assets/notification-icon.png",
              color: "#0058BB",
              defaultChannel: "default",
            },
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: IS_PROD
    ? {
        eas: {
          projectId: process.env.EAS_PROJECT_ID || "",
        },
      }
    : {},
};

module.exports = config;
