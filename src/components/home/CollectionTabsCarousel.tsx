import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections, fetchCollectionProducts } from "@/services/shopify.service";
import ProductCard from "@/components/ui/ProductCard";
import type { Collection, Product } from "@/types/shopify";

const CARD_WIDTH = 160;
const CARD_GAP = 12;

// ─── Aba individual ─────────────────────────────────────────────────────────

interface TabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Tab({ label, active, onPress }: TabProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.tabText, active && styles.tabTextActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Carrossel de produtos para a aba selecionada ─────────────────────────

interface ProductsRowProps {
  collectionHandle: string;
}

function ProductsRow({ collectionHandle }: ProductsRowProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["collection-products", collectionHandle],
    queryFn: () => fetchCollectionProducts(collectionHandle, 10),
    staleTime: 5 * 60 * 1000,
  });

  const products: Product[] = data?.products?.edges?.map((e: any) => e.node) ?? [];

  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color="#0058BB" />
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.loadingRow}>
        <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={products}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.productList}
      renderItem={({ item }) => (
        <View style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}>
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.handle}`)}
          />
        </View>
      )}
    />
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

interface Props {
  /** Número máximo de coleções exibidas como abas */
  maxTabs?: number;
}

export default function CollectionTabsCarousel({ maxTabs = 6 }: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabListRef = useRef<FlatList>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(maxTabs),
    staleTime: 10 * 60 * 1000,
  });

  const collections: Collection[] =
    data?.collections?.edges?.map((e: any) => e.node) ?? [];

  if (isLoading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator color="#0058BB" style={{ marginVertical: 24 }} />
      </View>
    );
  }

  if (!collections.length) return null;

  const active = collections[activeIndex];

  function handleTabPress(index: number) {
    setActiveIndex(index);
    tabListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>NOSSAS COLEÇÕES</Text>
        <TouchableOpacity
          onPress={() => router.push(`/collection/${active?.handle}`)}
        >
          <Text style={styles.seeAll}>Ver todos →</Text>
        </TouchableOpacity>
      </View>

      {/* Abas */}
      <FlatList
        ref={tabListRef}
        horizontal
        data={collections}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item, index }) => (
          <Tab
            label={item.title}
            active={index === activeIndex}
            onPress={() => handleTabPress(index)}
          />
        )}
      />

      {/* Linha separadora */}
      <View style={styles.divider} />

      {/* Produtos da aba ativa */}
      {active && <ProductsRow collectionHandle={active.handle} />}
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1a1c1c",
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0058BB",
  },
  tabList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: "#0058BB",
    borderColor: "#0058BB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  productList: {
    paddingHorizontal: 16,
  },
  loadingRow: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
