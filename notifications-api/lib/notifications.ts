import { Expo, ExpoPushMessage } from "expo-server-sdk";

export const expo = new Expo();

export function normalizeTokens(tokens: unknown) {
  if (!Array.isArray(tokens)) return [];

  return [...new Set(tokens.filter((token): token is string => {
    return typeof token === "string" && Expo.isExpoPushToken(token);
  }))];
}

export function createExpoMessages(input: {
  tokens: string[];
  title: string;
  message: string;
  url?: string;
  type?: string;
}): ExpoPushMessage[] {
  return input.tokens.map((token) => ({
    to: token,
    sound: "default",
    title: input.title,
    body: input.message,
    data: {
      url: input.url ?? "",
      type: input.type ?? "aviso_geral",
    },
  }));
}

export function assertNotificationApiKey(request: Request) {
  const configuredKey = process.env.NOTIFICATION_API_KEY;

  if (!configuredKey) {
    return {
      ok: false,
      status: 500,
      error: "NOTIFICATION_API_KEY não configurada.",
    } as const;
  }

  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== configuredKey) {
    return {
      ok: false,
      status: 401,
      error: "Não autorizado.",
    } as const;
  }

  return { ok: true } as const;
}
