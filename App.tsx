import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "./src/components/LoadingScreen";
import { OfflineScreen } from "./src/components/OfflineScreen";
import { WebViewScreen } from "./src/components/WebViewScreen";
import { useNetworkStatus } from "./src/hooks/useNetworkStatus";
import { useNotifications } from "./src/hooks/useNotifications";

export default function App() {
  const [pendingNotificationUrl, setPendingNotificationUrl] = useState<
    string | null
  >(null);
  const { isConnected, refresh } = useNetworkStatus();
  const { pushToken } = useNotifications(setPendingNotificationUrl);

  const handleNotificationUrlHandled = useCallback(() => {
    setPendingNotificationUrl(null);
  }, []);

  let content;

  if (isConnected === null) {
    content = (
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor="#0058BB" />
          <LoadingScreen />
        </View>
    );
  } else if (!isConnected) {
    content = (
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor="#0058BB" />
          <OfflineScreen onRetry={refresh} />
        </View>
    );
  } else {
    content = (
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor="#0058BB" />
        <WebViewScreen
          pushToken={pushToken}
          isConnected={isConnected}
          pendingNotificationUrl={pendingNotificationUrl}
          onNotificationUrlHandled={handleNotificationUrlHandled}
        />
      </View>
    );
  }

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0058BB",
  },
});
