import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "@/services/shopify.service";
import type { MenuItem } from "@/types/shopify";
import { APP_COLORS } from "@/theme/colors";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

// Ícones por handle de coleção
const DEPT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cozinha: "storefront-outline",
  "sala-de-estar": "tv-outline",
  sala: "tv-outline",
  "sala-de-jantar": "restaurant-outline",
  quarto: "bed-outline",
  "quarto-infantil": "happy-outline",
  escritorio: "desktop-outline",
  decoracao: "color-palette-outline",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { cart } = useCartStore();
  const { customer } = useAuthStore();

  const menuHandle = process.env.EXPO_PUBLIC_DEPARTMENTS_MENU_HANDLE ?? "departments";

  const { data: deptMenu, isLoading } = useQuery({
    queryKey: ["menu", menuHandle],
    queryFn: () => fetchMenu(menuHandle),
    staleTime: 5 * 60 * 1000,
  });

  const departments: MenuItem[] = deptMenu?.items ?? [];

  const cartCount =
    cart?.lines?.edges?.reduce(
      (acc: number, e: any) => acc + (e.node?.quantity ?? 0),
      0
    ) ?? 0;

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 24,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  function navigate(route: string) {
    onClose();
    setTimeout(() => router.push(route as any), 150);
  }

  const quickActions = [
    { id: "perfil", icon: "person-outline" as const, label: "Meu Perfil", route: "/(tabs)/profile" },
    { id: "pedidos", icon: "receipt-outline" as const, label: "Meus Pedidos", route: "/(tabs)/orders" },
    { id: "carrinho", icon: "cart-outline" as const, label: "Carrinho", route: "/(tabs)/cart", badge: cartCount },
    { id: "buscar", icon: "search-outline" as const, label: "Buscar", route: "/(tabs)/search" },
  ];

  return (
    <View
      style={[StyleSheet.absoluteFillObject, styles.shell]}
      pointerEvents={isOpen ? "auto" : "none"}
    >
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

          {/* ── Topo ── */}
          <View style={styles.top}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={20} color={APP_COLORS.surface} />
            </TouchableOpacity>
            <Text style={styles.topGreeting}>
              {customer
                ? `Olá, ${customer.firstName || "você"}!`
                : "Olá, visitante!"}
            </Text>
            <Text style={styles.topSub}>
              {customer
                ? "Bem-vindo à Maxxx Móveis."
                : "Acesse sua conta para acompanhar seus pedidos."}
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigate("/(tabs)/profile")}
              activeOpacity={0.85}
            >
              <Ionicons name="person-outline" size={15} color={APP_COLORS.surface} />
              <Text style={styles.loginBtnText}>
                {customer ? "Minha Conta" : "Entrar / Cadastrar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Quick Actions ── */}
          <View style={styles.quickRow}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.quickCard}
                onPress={() => navigate(a.route)}
                activeOpacity={0.75}
              >
                <View style={styles.quickIconWrap}>
                  <Ionicons name={a.icon} size={22} color={APP_COLORS.primary} />
                  {a.badge ? (
                    <View style={styles.quickBadge}>
                      <Text style={styles.quickBadgeText}>{a.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Departamentos ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DEPARTAMENTOS</Text>
            {isLoading ? (
              <ActivityIndicator color={APP_COLORS.primary} style={{ marginVertical: 16 }} />
            ) : (
              departments.map((item, idx) => {
                const handle = item.handle ?? item.id;
                const icon = DEPT_ICONS[handle] ?? "grid-outline";
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.navItem, idx === departments.length - 1 && styles.navItemLast]}
                    onPress={() => navigate(`/collection/${handle}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.navLeft}>
                      <Ionicons name={icon as any} size={18} color={APP_COLORS.primary} />
                      <Text style={styles.navText}>{item.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="#9ca3af" />
                  </TouchableOpacity>
                );
              })
            )}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigate("/(tabs)/search")}
            >
              <Text style={styles.viewAllText}>Ver todas as coleções</Text>
              <Ionicons name="arrow-forward" size={13} color={APP_COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Bloco promo ── */}
          <View style={styles.promoBlock}>
            <Text style={styles.promoEye}>OFERTA ESPECIAL</Text>
            <Text style={styles.promoTitle}>Até 60% OFF{"\n"}em Móveis Selecionados</Text>
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={() => navigate("/collection/promocoes" as any)}
            >
              <Text style={styles.promoBtnText}>Ver Ofertas</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { zIndex: 10200 },
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: APP_COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  // topo
  top: {
    backgroundColor: APP_COLORS.text,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topGreeting: { color: APP_COLORS.surface, fontSize: 16, fontWeight: "800", marginBottom: 4 },
  topSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 17, marginBottom: 14 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  loginBtnText: { color: APP_COLORS.surface, fontWeight: "700", fontSize: 14 },
  // quick
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  quickCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },
  quickIconWrap: { position: "relative" },
  quickBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: APP_COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  quickBadgeText: { color: APP_COLORS.surface, fontSize: 9, fontWeight: "800" },
  quickLabel: { fontSize: 11, fontWeight: "700", color: APP_COLORS.text, textAlign: "center" },
  // seção
  section: {
    backgroundColor: APP_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 1.4,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navItemLast: { borderBottomWidth: 0 },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  navText: { fontSize: 14, fontWeight: "600", color: APP_COLORS.text },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    margin: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  viewAllText: { fontSize: 13, fontWeight: "700", color: APP_COLORS.primary },
  // promo
  promoBlock: {
    margin: 12,
    borderRadius: 16,
    padding: 18,
    backgroundColor: APP_COLORS.primary,
    gap: 6,
  },
  promoEye: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
  },
  promoTitle: { fontSize: 18, fontWeight: "900", color: APP_COLORS.surface, lineHeight: 24 },
  promoBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: APP_COLORS.danger,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promoBtnText: { color: APP_COLORS.surface, fontWeight: "800", fontSize: 13 },
});
