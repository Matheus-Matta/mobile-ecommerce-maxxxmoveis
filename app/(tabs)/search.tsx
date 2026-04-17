import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchProducts } from "@/services/shopify.service";
import type { Product } from "@/types/shopify";
import { formatMoney } from "@/utils/format";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", search],
    queryFn: () => fetchProducts(20, undefined, search || undefined),
    enabled: true,
  });

  const products = data?.products ?? [];

  const handleSearch = useCallback(() => {
    setSearch(query.trim());
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-xl font-bold mb-4">Buscar</Text>
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-2">
          <Ionicons name="search-outline" size={20} color="#737373" />
          <TextInput
            className="flex-1 text-white ml-2 text-base"
            placeholder="Buscar móveis..."
            placeholderTextColor="#737373"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setSearch("");
              }}
            >
              <Ionicons name="close-circle" size={18} color="#737373" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E94560" />
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={60} color="#525252" />
          <Text className="text-neutral-500 text-lg mt-4 text-center">
            {search
              ? `Nenhum produto encontrado para "${search}"`
              : "Busque por produtos"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: "/product/[handle]",
                  params: { handle: item.handle },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function SearchProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const price = product.priceRange.minVariantPrice;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-surface rounded-xl overflow-hidden"
    >
      {product.featuredImage ? (
        <Image
          source={{ uri: product.featuredImage.url }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-surface-card items-center justify-center">
          <Ionicons name="cube-outline" size={40} color="#737373" />
        </View>
      )}
      <View className="p-3">
        <Text className="text-white text-sm font-medium" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-accent font-bold text-base mt-1">
          {formatMoney(price)}
        </Text>
        {!product.availableForSale && (
          <Text className="text-neutral-500 text-xs mt-1">Indisponível</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
