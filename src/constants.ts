// Nunca coloque chaves secretas aqui. Variáveis EXPO_PUBLIC_* vão para o bundle.
// Use variáveis sem EXPO_PUBLIC_ via EAS para chaves sensíveis.

const DEFAULT_ALLOWED_ORIGINS = [
  "https://maxxxmoveis.com.br",
  "https://www.maxxxmoveis.com.br",
] as const;

function parseList(value: string | undefined, fallback: readonly string[]) {
  if (!value) return [...fallback];

  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...fallback];
}

export const APP_CONFIG = {
  SITE_URL: process.env.EXPO_PUBLIC_SITE_URL ?? DEFAULT_ALLOWED_ORIGINS[0],
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? "",
  ALLOWED_ORIGINS: parseList(
    process.env.EXPO_PUBLIC_ALLOWED_ORIGINS,
    DEFAULT_ALLOWED_ORIGINS
  ),
  NOTIFICATION_CHANNEL_ID:
    process.env.EXPO_PUBLIC_NOTIFICATION_CHANNEL_ID ?? "maxxx-moveis-default",
  PUSH_TOKEN_STORAGE_KEY:
    process.env.EXPO_PUBLIC_PUSH_TOKEN_STORAGE_KEY ?? "expo_push_token",
} as const;

export const NOTIFICATION_CATEGORIES = {
  ORDERS: "orders",
  PROMOTIONS: "promotions",
  ACCOUNT: "account",
} as const;

export const SAMPLE_NOTIFICATIONS = [
  {
    title: "Maxxx Móveis",
    body: "Seu pedido foi atualizado.",
    data: {
      category: NOTIFICATION_CATEGORIES.ORDERS,
      url: `${APP_CONFIG.SITE_URL}/pedidos`,
    },
  },
  {
    title: "Maxxx Móveis",
    body: "Tem novidade esperando por você.",
    data: {
      category: NOTIFICATION_CATEGORIES.PROMOTIONS,
      url: APP_CONFIG.SITE_URL,
    },
  },
  {
    title: "Maxxx Móveis",
    body: "Acesse sua conta para ver os detalhes.",
    data: {
      category: NOTIFICATION_CATEGORIES.ACCOUNT,
      url: `${APP_CONFIG.SITE_URL}/minha-conta`,
    },
  },
] as const;
