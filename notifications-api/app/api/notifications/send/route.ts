import { NextRequest, NextResponse } from "next/server";

import {
  createDelivery,
  createNotification,
  getActiveTokensByUser,
} from "../../../../lib/db";
import {
  assertNotificationApiKey,
  createExpoMessages,
  expo,
  normalizeTokens,
} from "../../../../lib/notifications";

export async function POST(request: NextRequest) {
  const auth = assertNotificationApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { tokens, userId, title, message, url, type } = body as {
    tokens?: unknown;
    userId?: unknown;
    title?: unknown;
    message?: unknown;
    url?: unknown;
    type?: unknown;
  };

  if (typeof title !== "string" || typeof message !== "string") {
    return NextResponse.json(
      { error: "title e message são obrigatórios." },
      { status: 400 }
    );
  }

  const userTokens =
    typeof userId === "string" || typeof userId === "number"
      ? getActiveTokensByUser(String(userId)).map((item) => item.expoPushToken)
      : [];

  const normalizedTokens = normalizeTokens(tokens);
  const targetTokens = normalizeTokens([...normalizedTokens, ...userTokens]);

  if (targetTokens.length === 0) {
    return NextResponse.json(
      { error: "Informe tokens válidos ou um userId com tokens ativos." },
      { status: 400 }
    );
  }

  const messages = createExpoMessages({
    tokens: targetTokens,
    title,
    message,
    url: typeof url === "string" ? url : "",
    type: typeof type === "string" ? type : "aviso_geral",
  });

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  const status = tickets.every((ticket) => ticket.status === "ok")
    ? "sent"
    : tickets.some((ticket) => ticket.status === "ok")
      ? "partial"
      : "failed";

  const notification = createNotification({
    title,
    body: message,
    type: typeof type === "string" ? type : "aviso_geral",
    url: typeof url === "string" ? url : "",
    targetType: userTokens.length > 0 ? "user" : "tokens",
    targetUserId:
      typeof userId === "string" || typeof userId === "number"
        ? String(userId)
        : null,
    status,
  });

  tickets.forEach((ticket, index) => {
    const token = targetTokens[index];
    const ticketId = ticket.status === "ok" ? ticket.id : null;
    const errorMessage =
      ticket.status === "error"
        ? `${ticket.message}${
            ticket.details?.error ? ` (${ticket.details.error})` : ""
          }`
        : null;

    createDelivery({
      notificationId: notification.id,
      userId:
        typeof userId === "string" || typeof userId === "number"
          ? String(userId)
          : null,
      expoPushToken: token,
      ticketId,
      status: ticket.status,
      errorMessage,
    });
  });

  return NextResponse.json({
    success: true,
    sent: messages.length,
    notificationId: notification.id,
    tickets,
  });
}
