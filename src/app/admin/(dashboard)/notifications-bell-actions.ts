"use server";

import { getPayloadClient } from "@/lib/payload";

export type BellNotification = {
  id: number | string;
  eventType: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export async function getUnreadNotificationCount(): Promise<number> {
  const payload = await getPayloadClient();
  const { totalDocs } = await payload.count({
    collection: "notification-log",
    where: { read: { equals: false } },
  });
  return totalDocs;
}

export async function getRecentNotifications(): Promise<BellNotification[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "notification-log",
    sort: "-createdAt",
    limit: 15,
  });
  return docs.map((d) => ({
    id: d.id,
    eventType: d.eventType,
    message: d.message ?? d.eventType,
    link: d.link ?? null,
    read: d.read ?? false,
    createdAt: d.createdAt,
  }));
}

export async function markAllNotificationsRead(): Promise<void> {
  const payload = await getPayloadClient();
  await payload.update({
    collection: "notification-log",
    where: { read: { equals: false } },
    data: { read: true },
  });
}
