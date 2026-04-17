import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { formatMoney } from "@/utils/format";

export default function OrdersScreen() {
  const { customer, loading } = useAuthStore();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#E94560" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center px-8">
        <Ionicons name="receipt-outline" size={80} color="#525252" />
        <Text className="text-white text-xl font-bold mt-4">
          Faça login para ver seus pedidos
        </Text>
      </SafeAreaView>
    );
  }

  const orders = customer.orders.edges.map((e) => e.node);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-xl font-bold">Meus Pedidos</Text>
      </View>

      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="receipt-outline" size={60} color="#525252" />
          <Text className="text-neutral-500 text-lg mt-4 text-center">
            Você ainda não fez nenhum pedido
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="bg-surface rounded-xl p-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white font-bold text-base">
                  Pedido #{item.orderNumber}
                </Text>
                <View className={`px-2 py-1 rounded-full ${
                  item.financialStatus === "PAID"
                    ? "bg-green-900"
                    : "bg-yellow-900"
                }`}>
                  <Text className={`text-xs font-semibold ${
                    item.financialStatus === "PAID"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}>
                    {item.financialStatus === "PAID" ? "Pago" : item.financialStatus}
                  </Text>
                </View>
              </View>
              <Text className="text-neutral-500 text-sm mb-3">
                {new Date(item.processedAt).toLocaleDateString("pt-BR")}
              </Text>
              {item.lineItems.edges.slice(0, 2).map((le) => (
                <Text key={le.node.title} className="text-neutral-400 text-sm" numberOfLines={1}>
                  • {le.node.quantity}x {le.node.title}
                </Text>
              ))}
              {item.lineItems.edges.length > 2 && (
                <Text className="text-neutral-600 text-xs mt-1">
                  +{item.lineItems.edges.length - 2} iten(s)
                </Text>
              )}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-surface-card">
                <Text className="text-neutral-400 text-sm">Total</Text>
                <Text className="text-white font-bold">
                  {formatMoney(item.currentTotalPrice)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
