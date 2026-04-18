export const APP_COLOR_REGISTRY = Object.freeze({
  blue: "#0058bb",
  white: "#ffffff",
  red: "#ef4444",
  // Preto do sistema atual do projeto
  black: "#1a1c1c",
} as const);

export type AppColorKey = keyof typeof APP_COLOR_REGISTRY;

const appColorCache = new Map<AppColorKey, string>();

export function getCachedColor(key: AppColorKey): string {
  const cached = appColorCache.get(key);
  if (cached) return cached;

  const resolved = APP_COLOR_REGISTRY[key];
  appColorCache.set(key, resolved);
  return resolved;
}

export const APP_COLORS = Object.freeze({
  primary: getCachedColor("blue"),
  surface: getCachedColor("white"),
  danger: getCachedColor("red"),
  text: getCachedColor("black"),
} as const);
