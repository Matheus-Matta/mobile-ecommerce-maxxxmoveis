import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatMoney } from "@/utils/format";
import type { Product } from "@/types/shopify";

interface Props {
  product: Product;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  /** Texto da badge de promoção (ex: "-30%"). Oculta se não informado. */
  badgeLabel?: string;
}

export default function ProductCard({
  product,
  onPress,
  onFavorite,
  isFavorite = false,
  badgeLabel,
}: Props) {
  const variant = product.variants?.edges?.[0]?.node;
  const price = variant?.price;
  const compareAtPrice = variant?.compareAtPrice;
  const imageUrl = product.images?.edges?.[0]?.node?.url;
  const hasDiscount =
    compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount ?? "0");

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Imagem */}
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Ionicons name="image-outline" size={36} color="#d1d5db" />
          </View>
        )}

        {/* Badge de promoção — inferior esquerdo */}
        {badgeLabel && (
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        )}

        {/* Favorito — superior direito */}
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={onFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#ef4444" : "#9ca3af"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Informações */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {price && (
          <View style={styles.priceRow}>
            {hasDiscount && compareAtPrice && (
              <Text style={styles.comparePrice}>
                {formatMoney(compareAtPrice)}
              </Text>
            )}
            <Text style={hasDiscount ? styles.salePrice : styles.regularPrice}>
              {price ? formatMoney(price) : "—"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    // sombra sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
    aspectRatio: 1,
    backgroundColor: "#f7f7f7",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1c1c",
    lineHeight: 18,
  },
  priceRow: {
    marginTop: 2,
    gap: 2,
  },
  comparePrice: {
    fontSize: 11,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  salePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#16a34a",
  },
  regularPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1c1c",
  },
});
