import { NextRequest, NextResponse } from "next/server";

import {
  deactivateDeviceToken,
  listDeliveriesWithTickets,
  updateDeliveryByTicketId,
} from "../../../../lib/db";
import { assertNotificationApiKey, expo } from "../../../../lib/notifications";

export async function POST(request: NextRequest) {
  const auth = assertNotificationApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const deliveries = listDeliveriesWithTickets();
  const ticketIds = deliveries
    .map((delivery) => delivery.ticketId)
    .filter((ticketId): ticketId is string => Boolean(ticketId));

  if (ticketIds.length === 0) {
    return NextResponse.json({ success: true, receipts: {} });
  }

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
  const receipts = {};

  for (const chunk of receiptIdChunks) {
    const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
    Object.assign(receipts, receiptChunk);

    for (const [ticketId, receipt] of Object.entries(receiptChunk)) {
      const errorMessage =
        receipt.status === "error"
          ? `${receipt.message ?? "Erro desconhecido"}${
              receipt.details?.error ? ` (${receipt.details.error})` : ""
            }`
          : null;

      const delivery = updateDeliveryByTicketId(ticketId, {
        status: receipt.status,
        errorMessage,
      });

      if (
        delivery &&
        receipt.status === "error" &&
        receipt.details?.error === "DeviceNotRegistered"
      ) {
        deactivateDeviceToken(delivery.expoPushToken);
      }
    }
  }

  return NextResponse.json({
    success: true,
    receipts,
  });
}
