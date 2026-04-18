import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Data de fim padrão: 31/12/2026 23:59 — mesma do site
const DEFAULT_END_DATE = new Date("2026-12-31T23:59:00");

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(endDate: Date): TimeLeft {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  const totalSec = Math.floor(diff / 1000);
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface CounterUnitProps {
  value: number;
  label: string;
}

function CounterUnit({ value, label }: CounterUnitProps) {
  return (
    <View className="items-center">
      <View style={styles.counterBox}>
        <Text style={styles.counterNumber}>{pad(value)}</Text>
      </View>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );
}

interface Props {
  endDate?: Date;
  title?: string;
  subtitle?: string;
  discountLabel?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export default function FlashOffersCard({
  endDate = DEFAULT_END_DATE,
  title = "OFERTAS\nRELÂMPAGO!",
  subtitle = "Aproveite descontos de até",
  discountLabel = "60% OFF",
  ctaLabel = "VER OFERTAS",
  ctaUrl = "https://maxxxmoveis.com.br/collections/promocoes",
}: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(endDate)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimeLeft(calcTimeLeft(endDate));
  }, [endDate]);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  return (
    <View className="mx-4 my-2">
      <View style={styles.card}>
        {/* Ícone decorativo de fundo */}
        <View style={styles.bgIcon} pointerEvents="none">
          <Ionicons name="timer-outline" size={220} color="rgba(255,255,255,0.06)" />
        </View>

        {/* Coluna esquerda: Texto */}
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {subtitle}{" "}
            <Text style={styles.discount}>{discountLabel}</Text>
          </Text>
        </View>

        {/* Coluna direita: Timer + CTA */}
        <View style={styles.right}>
          {timeLeft.expired ? (
            <Text style={styles.expiredLabel}>ENCERRADA</Text>
          ) : (
            <>
              <Text style={styles.timerLabel}>A OFERTA ACABA EM:</Text>
              <View style={styles.counterRow}>
                <CounterUnit value={timeLeft.hours} label="HORAS" />
                <Text style={styles.separator}>:</Text>
                <CounterUnit value={timeLeft.minutes} label="MIN" />
                <Text style={styles.separator}>:</Text>
                <CounterUnit value={timeLeft.seconds} label="SEG" />
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(ctaUrl)}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0058BB",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
    // sombra (iOS + Android)
    shadowColor: "#0058BB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  bgIcon: {
    position: "absolute",
    top: -20,
    right: -20,
    opacity: 1,
  },
  left: {
    flex: 1,
    gap: 6,
  },
  right: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 26,
    letterSpacing: -0.5,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 12,
    color: "#fff4ea",
    fontWeight: "500",
  },
  discount: {
    fontWeight: "900",
    color: "#ffffff",
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ffe6d3",
    letterSpacing: 1,
    textAlign: "center",
  },
  expiredLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffe6d3",
    letterSpacing: 1,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  counterBox: {
    backgroundColor: "#1a1c1c",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: "center",
  },
  counterNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  counterLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  separator: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 26,
  },
  cta: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
