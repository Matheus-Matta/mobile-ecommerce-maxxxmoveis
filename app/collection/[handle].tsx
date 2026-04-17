import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchCollectionProducts } from "@/services/shopify.service";
import type { Product } from "@/types/shopify";
import { formatMoney } from "@/utils/format";

export default function CollectionScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const navigation = useNavigation();

  const { data, isLoading } = useQuery({
    queryKey: ["collection", handle],
    queryFn: () => fetchCollectionProducts(handle, 20),
    enabled: !!handle,
  });

  useEffect(() => {
    if (data?.collection.title) {
      navigation.setOptions({ title: data.collection.title });
    }
  }, [data, navigation]);

  const products = data?.products ?? [];

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E94560" />
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cube-outline" size={60} color="#525252" />
          <Text className="text-neutral-500 text-lg mt-4 text-center">
            Nenhum produto nesta coleção
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: 12 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionProductCard
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

function CollectionProductCard({
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
          className="w-full h-44"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-44 bg-surface-card items-center justify-center">
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
      </View>
    </TouchableOpacity>
  );
}
