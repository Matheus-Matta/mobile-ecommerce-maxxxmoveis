import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections } from "@/services/shopify.service";
import type { Collection } from "@/types/shopify";

// Categorias locais como fallback (espelhadas do site real, com imagens CDN da loja)
export const STATIC_CATEGORIES: Collection[] = [
  {
    id: "cozinha",
    title: "Cozinha",
    handle: "cozinha",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/Cozinha-Alexia_CINAMOMOGRAFITE-C-ESPELHO_AMBIENTE.jpg?v=1775254180&width=400",
      altText: "Cozinha",
    },
  },
  {
    id: "sala",
    title: "Sala de Estar",
    handle: "sala",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/7598.jpg?v=1775749836&width=400",
      altText: "Sala de Estar",
    },
  },
  {
    id: "sala-de-jantar",
    title: "Sala de Jantar",
    handle: "sala-de-jantar",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/MESA-BERLIM-1000X1000-04-CAD-LISBOA-TAMPO-REDONDO-OFF-PLUS-COR-CINAMOMO-TEC-169-2.jpg?v=1775254143&width=400",
      altText: "Sala de Jantar",
    },
  },
  {
    id: "quarto",
    title: "Quarto",
    handle: "quarto",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/Cama-Casal-Iris-Castanho-Wood-Avela.jpg?v=1775254051&width=400",
      altText: "Quarto",
    },
  },
  {
    id: "quarto-infantil",
    title: "Quarto Infantil",
    handle: "quarto-infantil",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/cama-Montessoriana01.jpg?v=1775254260&width=400",
      altText: "Quarto Infantil",
    },
  },
  {
    id: "escritorio",
    title: "Escritório",
    handle: "escritorio",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/1-Vitoria-Escrivaninha-29100.webp?v=1775254284&width=400",
      altText: "Escritório",
    },
  },
  {
    id: "decoracao",
    title: "Decoração",
    handle: "decoracao",
    description: "",
    image: {
      url: "https://maxxxmoveis.com.br/cdn/shop/collections/puff_decorativo_metal_moveis_onix_com_assento_de_4cm_1567018531_8445_600x600_f2e185aa-adc9-4df0-b884-75b9ac75e5ec.jpg?v=1775254393&width=400",
      altText: "Decoração",
    },
  },
];

interface CategoryItemProps {
  item: Collection;
  onPress: () => void;
}

function CategoryItem({ item, onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      style={{ width: 100 }}
    >
      <View
        className="overflow-hidden mb-2"
        style={{
          width: 100,
          height: 96,
          borderRadius: 20,
          backgroundColor: "#eeeeee",
        }}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image.url }}
            style={{ width: 100, height: 96 }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl">🪑</Text>
          </View>
        )}
      </View>
      <Text
        className="text-text font-bold text-center"
        style={{ fontSize: 12 }}
        numberOfLines={1}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

interface Props {
  /** Usar dados estáticos mesmo quando a API retornar coleções (útil se a API não tiver imagens) */
  useStatic?: boolean;
}

export default function CategoryStrip({ useStatic = false }: Props) {
  const { data: apiCollections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => fetchCollections(12),
    enabled: !useStatic,
  });

  const categories: Collection[] =
    useStatic || !apiCollections?.length
      ? STATIC_CATEGORIES
      : apiCollections;

  return (
    <View className="py-4">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text
          className="text-text font-extrabold"
          style={{ fontSize: 16 }}
        >
          Navegue por categorias
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
          <Text className="text-brand font-bold text-xs">
            Ver todas →
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !useStatic ? (
        <ActivityIndicator color="#0058BB" className="py-4" />
      ) : (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryItem
              item={item}
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
  );
}
