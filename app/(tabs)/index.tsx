import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import HeroBanner from "@/components/home/HeroBanner";

export default function HomeScreen() {
  return (
    // edges=[] pois AppHeader já usa useSafeAreaInsets para o topo
    <SafeAreaView style={styles.root} edges={["bottom", "left", "right"]}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <HeroBanner />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f8fa" },
  scroll: { flex: 1 },
});
