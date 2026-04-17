import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchCollections, fetchProducts } from "@/services/shopify.service";
import type { Product, Collection } from "@/types/shopify";
import { formatMoney } from "@/utils/format";

export default function HomeScreen() {
  const { data: collections, isLoading: loadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(8),
  });

  const { data: featuredData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts(8),
  });

  const products = featuredData?.products ?? [];

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
        <View>
          <Text className="text-neutral-400 text-sm">Bem-vindo à</Text>
          <Text className="text-white text-2xl font-bold tracking-wide">
            Maxxx Móveis
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          className="bg-surface p-2 rounded-full"
        >
          <Ionicons name="search-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View className="mx-4 mb-6 rounded-2xl bg-surface-card overflow-hidden">
          <View className="p-6">
            <Text className="text-neutral-400 text-sm mb-1">Nova coleção</Text>
            <Text className="text-white text-2xl font-bold mb-2">
              Móveis com{"\n"}estilo e qualidade
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              className="bg-accent self-start px-5 py-2 rounded-full mt-2"
            >
              <Text className="text-white font-semibold">Ver produtos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collections */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-white text-lg font-bold">Categorias</Text>
          </View>
          {loadingCollections ? (
            <ActivityIndicator color="#E94560" className="py-4" />
          ) : (
            <FlatList
              data={collections}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CollectionCard
                  collection={item}
                  onPress={() =>
                    router.push({
                      pathname: "/collection/[handle]",
                      params: { handle: item.handle },
                    })
                  }
                />
              )}
            />
          )}
        </View>

        {/* Featured Products */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-white text-lg font-bold">Destaques</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text className="text-accent text-sm">Ver todos</Text>
            </TouchableOpacity>
          </View>
          {loadingProducts ? (
            <ActivityIndicator color="#E94560" className="py-4" />
          ) : (
            <FlatList
              data={products}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
              columnWrapperStyle={{ gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CollectionCard({
  collection,
  onPress,
}: {
  collection: Collection;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-xl overflow-hidden w-32"
    >
      {collection.image ? (
        <Image
          source={{ uri: collection.image.url }}
          className="w-32 h-20"
          resizeMode="cover"
        />
      ) : (
        <View className="w-32 h-20 bg-surface-card items-center justify-center">
          <Ionicons name="cube-outline" size={28} color="#737373" />
        </View>
      )}
      <Text
        className="text-white text-xs font-medium px-2 py-2 text-center"
        numberOfLines={1}
      >
        {collection.title}
      </Text>
    </TouchableOpacity>
  );
}

function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const price = product.priceRange.minVariantPrice;
  const compareAt =
    product.compareAtPriceRange?.minVariantPrice?.amount &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(price.amount)
      ? product.compareAtPriceRange.minVariantPrice
      : null;

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
        <View className="mt-1">
          {compareAt && (
            <Text className="text-neutral-500 text-xs line-through">
              {formatMoney(compareAt)}
            </Text>
          )}
          <Text className="text-accent font-bold text-base">
            {formatMoney(price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
