import { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "@/store/cartStore";
import { APP_COLORS } from "@/theme/colors";
import DrawerMenu from "./DrawerMenu";

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount =
    cart?.lines?.edges?.reduce(
      (acc: number, e: any) => acc + (e.node?.quantity ?? 0),
      0
    ) ?? 0;

  const paddingTop = insets.top + 8;

  return (
    <>
      <View style={[styles.container, { paddingTop }]}>
        <View style={styles.row}>
          {/* ── Botão hamburguer ── */}
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="menu" size={22} color={APP_COLORS.text} />
          </TouchableOpacity>

          {/* ── Barra de busca (pressable, navega para /(tabs)/search) ── */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push("/(tabs)/search")}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={17} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="O que você está procurando?"
              placeholderTextColor="#9ca3af"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* ── Botão carrinho ── */}
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => router.push("/(tabs)/cart")}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="cart-outline" size={22} color={APP_COLORS.text} />
            {/* Badge dot (estilo do header.html) */}
            {cartCount > 0 && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: APP_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#30323b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: APP_COLORS.primary,
    borderWidth: 1.5,
    borderColor: APP_COLORS.surface,
  },
  // ── Barra de busca ──
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#30323b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: APP_COLORS.text,
    ...Platform.select({
      android: { paddingVertical: 0 },
    }),
  },
});
