import { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 180;
const AUTO_PLAY_MS = 6000;

export interface BannerSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  alt?: string;
}

// Banners reais do site maxxxmoveis.com.br
export const REAL_BANNERS: BannerSlide[] = [
  {
    id: "1",
    imageUrl:
      "https://maxxxmoveis.com.br/cdn/shop/files/1920x600.png?v=1775576232&width=1080",
    linkUrl: "https://maxxxmoveis.com.br/collections/promocoes",
    alt: "Promoções",
  },
  {
    id: "2",
    imageUrl:
      "https://maxxxmoveis.com.br/cdn/shop/files/banner-vantagens.png?v=1776216067&width=1080",
    alt: "Vantagens",
  },
  {
    id: "3",
    imageUrl:
      "https://maxxxmoveis.com.br/cdn/shop/files/localizacao_maxx_site_a4c58277-110a-4ca5-98ea-a4cbd2db26fa_1.jpg?v=1775582657&width=1080",
    alt: "Nossa loja",
  },
  {
    id: "4",
    imageUrl:
      "https://maxxxmoveis.com.br/cdn/shop/files/Site_9.png?v=1768402340&width=1080",
    linkUrl: "https://www.instagram.com/maxmoveis_oficial/",
    alt: "Instagram",
  },
  {
    id: "5",
    imageUrl:
      "https://maxxxmoveis.com.br/cdn/shop/files/SAC_1.png?v=1762970802&width=1080",
    alt: "Atendimento",
  },
];

interface Props {
  slides?: BannerSlide[];
  height?: number;
  autoPlay?: boolean;
}

export default function HeroBanner({
  slides = REAL_BANNERS,
  height = BANNER_HEIGHT,
  autoPlay = true,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerSlide>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + slides.length) % slides.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    },
    [slides.length]
  );

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_PLAY_MS);
  }, [autoPlay, slides.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const handlePress = (slide: BannerSlide) => {
    if (slide.linkUrl) Linking.openURL(slide.linkUrl);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollBeginDrag={stopAutoPlay}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setActiveIndex(index);
          startAutoPlay();
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={item.linkUrl ? 0.9 : 1}
            onPress={() => handlePress(item)}
            style={{ width: SCREEN_WIDTH }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: SCREEN_WIDTH, height }}
              resizeMode="cover"
              accessibilityLabel={item.alt}
            />
          </TouchableOpacity>
        )}
      />

      {/* Dots */}
      {slides.length > 1 && (
        <View className="flex-row justify-center gap-2 py-2.5">
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View
                style={{
                  width: i === activeIndex ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === activeIndex ? "#0058BB" : "#d4d4d8",
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
