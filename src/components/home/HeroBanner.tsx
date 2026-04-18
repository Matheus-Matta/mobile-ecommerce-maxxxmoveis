import { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchBanners } from "@/services/shopify.service";
import type { BannerMetaobject } from "@/types/shopify";
import { APP_COLORS } from "@/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 200;
const AUTO_PLAY_MS = 8000;
const PADDING_H = 16;
const BANNER_WIDTH = SCREEN_WIDTH - PADDING_H * 2;

interface BannerSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  alt?: string;
}


export default function HeroBanner() {
  const { data: apiBanners, isLoading } = useQuery<BannerMetaobject[]>({
    queryKey: ["banners", process.env.EXPO_PUBLIC_BANNER_METAOBJECT_TYPE],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!apiBanners) return;
    console.log("[HeroBanner] banners metaobjects:", apiBanners);
  }, [apiBanners]);

  const slides: BannerSlide[] = (apiBanners ?? []).map((b) => ({
    id: b.id,
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl,
    alt: b.alt,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerSlide>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (slides.length <= 1) return;
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_PLAY_MS);
  }, [slides.length, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (isLoading) {
    return (
      <View style={[styles.loadingBox, { marginHorizontal: PADDING_H }]}>
        <ActivityIndicator color={APP_COLORS.primary} />
      </View>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH + 12,
          offset: (BANNER_WIDTH + 12) * index,
          index,
        })}
        onScrollBeginDrag={stopAutoPlay}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12)
          );
          setActiveIndex(index);
          startAutoPlay();
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={item.linkUrl ? 0.9 : 1}
            onPress={() => item.linkUrl && Linking.openURL(item.linkUrl)}
            style={styles.slide}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.slideImage}
              resizeMode="cover"
              accessibilityLabel={item.alt}
            />
          </TouchableOpacity>
        )}
      />

      {/* Dots */}
      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
            >
              <View
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  loadingBox: {
    height: BANNER_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: PADDING_H,
    gap: 12,
  },
  slide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    // sombra equivalente ao HTML: shadow-[0_8px_24px_rgba(79,93,140,0.2)]
    shadowColor: "#4f5d8c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  // imagem ocupando todo o card do banner
  slideImage: {
    width: "100%",
    height: "100%",
  },
  // dots
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: APP_COLORS.surface,
  },
  dotInactive: {
    width: 7,
    backgroundColor: "#d1d5db",
  },
});
