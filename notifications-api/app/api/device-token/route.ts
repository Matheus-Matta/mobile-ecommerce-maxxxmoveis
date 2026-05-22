import { Expo } from "expo-server-sdk";
import { NextRequest, NextResponse } from "next/server";

import { upsertDeviceToken } from "../../../lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { userId, token, platform } = body as {
    userId?: unknown;
    token?: unknown;
    platform?: unknown;
  };

  if (
    (typeof userId !== "string" && typeof userId !== "number") ||
    typeof token !== "string" ||
    typeof platform !== "string"
  ) {
    return NextResponse.json(
      { error: "userId, token e platform são obrigatórios." },
      { status: 400 }
    );
  }

  if (!Expo.isExpoPushToken(token)) {
    return NextResponse.json(
      { error: "ExpoPushToken inválido." },
      { status: 400 }
    );
  }

  const record = upsertDeviceToken({
    userId: String(userId),
    token,
    platform,
  });

  return NextResponse.json({
    success: true,
    message: "Token salvo com sucesso.",
    deviceToken: {
      id: record.id,
      userId: record.userId,
      platform: record.platform,
      active: record.active,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
  });
}
