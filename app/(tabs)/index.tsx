import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import HeroBanner from "@/components/home/HeroBanner";
import CategoryStrip from "@/components/home/CategoryStrip";
import FlashOffersCard from "@/components/home/FlashOffersCard";
import CollectionTabsCarousel from "@/components/home/CollectionTabsCarousel";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Maxxx Móveis</Text>
        <TouchableOpacity
          style={styles.searchBtn}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="search-outline" size={22} color="#1a1c1c" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* 1. Banner hero com carrossel */}
        <HeroBanner />

        {/* 2. Tira de categorias */}
        <CategoryStrip />

        {/* 3. Card de ofertas relâmpago com contagem regressiva */}
        <FlashOffersCard />

        {/* 4. Abas de coleções com carrossel de produtos */}
        <CollectionTabsCarousel />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0058BB",
    letterSpacing: -0.5,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
});
