import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";

function getConnectionState(isConnected: boolean | null, isReachable: boolean | null) {
  return isConnected === true && isReachable !== false;
}

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(
        getConnectionState(state.isConnected, state.isInternetReachable)
      );
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(
      getConnectionState(state.isConnected, state.isInternetReachable)
    );
  }, []);

  return { isConnected, refresh };
}
