import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "@/store/cartStore";
import type { CartLine } from "@/types/shopify";
import { formatMoney } from "@/utils/format";

export default function CartScreen() {
  const { cart, loading, updateItem, removeItem } = useCartStore();
  const lines = cart?.lines?.edges?.map((e) => e.node) ?? [];

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      Linking.openURL(cart.checkoutUrl);
    }
  };

  if (!cart || lines.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center px-8">
        <Ionicons name="cart-outline" size={80} color="#525252" />
        <Text className="text-white text-xl font-bold mt-4">
          Carrinho vazio
        </Text>
        <Text className="text-neutral-500 text-base mt-2 text-center">
          Adicione produtos ao carrinho para continuar
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-xl font-bold">
          Carrinho ({cart.totalQuantity})
        </Text>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <CartLineItem
            line={item}
            loading={loading}
            onUpdateQuantity={(qty) => updateItem(item.id, qty)}
            onRemove={() => removeItem(item.id)}
          />
        )}
      />

      {/* Checkout Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface-card px-4 pt-4 pb-8">
        <View className="flex-row justify-between mb-3">
          <Text className="text-neutral-400">Subtotal</Text>
          <Text className="text-white font-semibold">
            {formatMoney(cart.cost.subtotalAmount)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-white font-bold text-lg">Total</Text>
          <Text className="text-accent font-bold text-lg">
            {formatMoney(cart.cost.totalAmount)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          className="bg-accent rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            Finalizar compra
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function CartLineItem({
  line,
  loading,
  onUpdateQuantity,
  onRemove,
}: {
  line: CartLine;
  loading: boolean;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View className="bg-surface rounded-xl p-3 flex-row">
      {line.merchandise.product.featuredImage ? (
        <Image
          source={{ uri: line.merchandise.product.featuredImage.url }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-lg bg-surface-card items-center justify-center">
          <Ionicons name="cube-outline" size={32} color="#737373" />
        </View>
      )}
      <View className="flex-1 ml-3 justify-between">
        <View className="flex-row justify-between items-start">
          <Text className="text-white font-medium flex-1 mr-2" numberOfLines={2}>
            {line.merchandise.product.title}
          </Text>
          <TouchableOpacity onPress={onRemove} disabled={loading}>
            <Ionicons name="trash-outline" size={18} color="#737373" />
          </TouchableOpacity>
        </View>
        <Text className="text-neutral-500 text-xs">{line.merchandise.title}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-accent font-bold">
            {formatMoney(line.merchandise.price)}
          </Text>
          <View className="flex-row items-center bg-surface-card rounded-lg">
            <TouchableOpacity
              onPress={() => onUpdateQuantity(Math.max(0, line.quantity - 1))}
              disabled={loading}
              className="px-3 py-1"
            >
              <Ionicons name="remove" size={16} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-semibold px-2">{line.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(line.quantity + 1)}
              disabled={loading}
              className="px-3 py-1"
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
