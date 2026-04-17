import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { fetchProductByHandle } from "@/services/shopify.service";
import { useCartStore } from "@/store/cartStore";
import type { ProductVariant } from "@/types/shopify";
import { formatMoney } from "@/utils/format";

const { width } = Dimensions.get("window");

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [imageIndex, setImageIndex] = useState(0);
  const { addItem, loading: cartLoading } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
    enabled: !!handle,
  });

  const handleAddToCart = async () => {
    const variant =
      selectedVariant ?? product?.variants?.edges?.[0]?.node;
    if (!variant) return;
    try {
      await addItem(variant.id, 1);
      Alert.alert("Adicionado!", `"${product?.title}" foi adicionado ao carrinho.`, [
        { text: "Continuar", style: "cancel" },
        {
          text: "Ver carrinho",
          onPress: () => router.push("/(tabs)/cart"),
        },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#E94560" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={60} color="#525252" />
        <Text className="text-white text-lg mt-4 text-center">
          Produto não encontrado
        </Text>
      </SafeAreaView>
    );
  }

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const activeVariant = selectedVariant ?? variants[0];
  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = activeVariant?.compareAtPrice;

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <FlatList
          data={images.length > 0 ? images : [null]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={(e) => {
            setImageIndex(
              Math.round(e.nativeEvent.contentOffset.x / width)
            );
          }}
          renderItem={({ item }) =>
            item ? (
              <Image
                source={{ uri: item.url }}
                style={{ width, height: 320 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{ width, height: 320 }}
                className="bg-surface-card items-center justify-center"
              >
                <Ionicons name="cube-outline" size={80} color="#737373" />
              </View>
            )
          }
        />
        {images.length > 1 && (
          <View className="flex-row justify-center gap-2 py-3">
            {images.map((_, i) => (
              <View
                key={i}
                className={`rounded-full ${
                  i === imageIndex
                    ? "w-4 h-2 bg-accent"
                    : "w-2 h-2 bg-neutral-600"
                }`}
              />
            ))}
          </View>
        )}

        {/* Product Info */}
        <View className="px-4 pt-4 pb-32">
          {product.vendor && (
            <Text className="text-accent text-sm font-semibold mb-1 uppercase tracking-wider">
              {product.vendor}
            </Text>
          )}
          <Text className="text-white text-2xl font-bold mb-3">
            {product.title}
          </Text>

          {/* Price */}
          <View className="flex-row items-baseline gap-3 mb-5">
            <Text className="text-accent text-2xl font-bold">
              {formatMoney(price)}
            </Text>
            {compareAt &&
              parseFloat(compareAt.amount) > parseFloat(price.amount) && (
                <Text className="text-neutral-500 text-base line-through">
                  {formatMoney(compareAt)}
                </Text>
              )}
          </View>

          {/* Variants */}
          {product.options && product.options.length > 0 && (
            <View className="mb-5">
              {product.options.map((option) => (
                <View key={option.id} className="mb-3">
                  <Text className="text-white font-semibold mb-2">
                    {option.name}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {option.values.map((value) => {
                      const variant = variants.find((v) =>
                        v.selectedOptions.some(
                          (o) => o.name === option.name && o.value === value
                        )
                      );
                      const isSelected =
                        activeVariant?.selectedOptions?.some(
                          (o) => o.name === option.name && o.value === value
                        );
                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() => variant && setSelectedVariant(variant)}
                          disabled={!variant?.availableForSale}
                          className={`px-4 py-2 rounded-lg border ${
                            isSelected
                              ? "bg-accent border-accent"
                              : variant?.availableForSale
                              ? "bg-surface border-surface-card"
                              : "bg-surface border-surface-card opacity-40"
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              isSelected ? "text-white" : "text-neutral-400"
                            }`}
                          >
                            {value}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View>
              <Text className="text-white font-bold text-base mb-2">
                Descrição
              </Text>
              <Text className="text-neutral-400 leading-6 text-sm">
                {product.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-primary border-t border-surface px-4 py-5">
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={cartLoading || !activeVariant?.availableForSale}
          className={`rounded-xl py-4 items-center ${
            activeVariant?.availableForSale ? "bg-accent" : "bg-neutral-700"
          }`}
        >
          {cartLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {activeVariant?.availableForSale
                ? "Adicionar ao carrinho"
                : "Indisponível"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
