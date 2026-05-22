export type DeviceToken = {
  id: string;
  userId: string;
  expoPushToken: string;
  platform: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  type: string;
  url: string;
  targetType: "tokens" | "user";
  targetUserId: string | null;
  sentAt: Date;
  status: "sent" | "partial" | "failed";
};

export type NotificationDelivery = {
  id: string;
  notificationId: string;
  userId: string | null;
  expoPushToken: string;
  ticketId: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const deviceTokens = new Map<string, DeviceToken>();
const notifications = new Map<string, NotificationRecord>();
const deliveries = new Map<string, NotificationDelivery>();

export function upsertDeviceToken(input: {
  userId: string;
  token: string;
  platform: string;
}) {
  const now = new Date();
  const existing = deviceTokens.get(input.token);

  if (existing) {
    existing.userId = input.userId;
    existing.platform = input.platform;
    existing.active = true;
    existing.updatedAt = now;
    return existing;
  }

  const record: DeviceToken = {
    id: crypto.randomUUID(),
    userId: input.userId,
    expoPushToken: input.token,
    platform: input.platform,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  deviceTokens.set(input.token, record);
  return record;
}

export function getActiveTokensByUser(userId: string) {
  return [...deviceTokens.values()].filter(
    (token) => token.active && token.userId === userId
  );
}

export function deactivateDeviceToken(expoPushToken: string) {
  const token = deviceTokens.get(expoPushToken);
  if (!token) return;

  token.active = false;
  token.updatedAt = new Date();
}

export function createNotification(input: {
  title: string;
  body: string;
  type: string;
  url: string;
  targetType: "tokens" | "user";
  targetUserId?: string | null;
  status: NotificationRecord["status"];
}) {
  const record: NotificationRecord = {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    type: input.type,
    url: input.url,
    targetType: input.targetType,
    targetUserId: input.targetUserId ?? null,
    sentAt: new Date(),
    status: input.status,
  };

  notifications.set(record.id, record);
  return record;
}

export function createDelivery(input: {
  notificationId: string;
  userId?: string | null;
  expoPushToken: string;
  ticketId?: string | null;
  status: string;
  errorMessage?: string | null;
}) {
  const now = new Date();
  const record: NotificationDelivery = {
    id: crypto.randomUUID(),
    notificationId: input.notificationId,
    userId: input.userId ?? null,
    expoPushToken: input.expoPushToken,
    ticketId: input.ticketId ?? null,
    status: input.status,
    errorMessage: input.errorMessage ?? null,
    createdAt: now,
    updatedAt: now,
  };

  deliveries.set(record.id, record);
  return record;
}

export function updateDeliveryByTicketId(
  ticketId: string,
  input: { status: string; errorMessage?: string | null }
) {
  const delivery = [...deliveries.values()].find(
    (item) => item.ticketId === ticketId
  );

  if (!delivery) return null;

  delivery.status = input.status;
  delivery.errorMessage = input.errorMessage ?? null;
  delivery.updatedAt = new Date();
  return delivery;
}

export function listDeliveriesWithTickets() {
  return [...deliveries.values()].filter((delivery) => delivery.ticketId);
}
