import "server-only";

import { getPayloadClient } from "./payload";
import { sendEmail } from "./mailer";
import { formatPHP } from "./format";
import { renderEmailLayout } from "./email-template";

export type NotificationEvent =
  | "new-order"
  | "payment-confirmed"
  | "payment-failed"
  | "contact-form"
  | "low-stock";

const TOGGLE_KEY: Record<NotificationEvent, string> = {
  "new-order": "newOrder",
  "payment-confirmed": "paymentConfirmed",
  "payment-failed": "paymentFailed",
  "contact-form": "contactForm",
  "low-stock": "lowStock",
};

const SUBJECTS: Record<NotificationEvent, string> = {
  "new-order": "New order placed",
  "payment-confirmed": "Payment confirmed",
  "payment-failed": "Payment failed",
  "contact-form": "New contact form submission",
  "low-stock": "Low stock alert",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function logNotification(
  eventType: NotificationEvent,
  recipient: string,
  sent: boolean,
  message?: string,
  link?: string
) {
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "notification-log",
      data: { eventType, recipient, sentStatus: sent ? "sent" : "failed", message, link, read: false },
    });
  } catch (err) {
    console.error("[notify] Failed to write notification log:", err);
  }
}

async function notify({
  event,
  bodyHtml,
  ctaLabel,
  ctaHref,
  link,
  preheader,
}: {
  event: NotificationEvent;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  link?: string;
  preheader?: string;
}) {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });

  const enabled = settings.notifications?.[TOGGLE_KEY[event] as keyof typeof settings.notifications] ?? true;
  const recipient = settings.notificationEmail;

  if (!enabled || !recipient) return;

  const html = renderEmailLayout({
    heading: SUBJECTS[event],
    preheader,
    bodyHtml,
    ctaLabel,
    ctaHref,
  });

  const sent = await sendEmail({ to: recipient, subject: `Handmade Crochet Co. — ${SUBJECTS[event]}`, html });
  await logNotification(event, recipient, sent, preheader ?? SUBJECTS[event], link ?? ctaHref);
}

export async function notifyNewOrder(order: { id: number | string; buyerName: string; total: number }) {
  const href = `${APP_URL}/admin/orders/${order.id}?highlight=order-${order.id}`;
  await notify({
    event: "new-order",
    preheader: `Order #${order.id} from ${order.buyerName} — ${formatPHP(order.total)}`,
    bodyHtml: `
      <p>New order placed on Handmade Crochet Co..</p>
      <p><strong>Order #${order.id}</strong> — ${order.buyerName} — ${formatPHP(order.total)}</p>
    `,
    ctaLabel: "View Order",
    ctaHref: href,
    link: href,
  });
}

export async function notifyPaymentConfirmed(order: { id: number | string; buyerName: string; total: number }) {
  const href = `${APP_URL}/admin/orders/${order.id}?highlight=order-${order.id}`;
  await notify({
    event: "payment-confirmed",
    preheader: `Payment confirmed for order #${order.id}`,
    bodyHtml: `
      <p>Payment confirmed for order <strong>#${order.id}</strong> (${order.buyerName}, ${formatPHP(order.total)}).</p>
      <p>You can now start preparing this order for fulfillment.</p>
    `,
    ctaLabel: "View Order",
    ctaHref: href,
    link: href,
  });
}

export async function notifyContactForm(message: { id: number | string; name: string; email: string; message: string }) {
  await notify({
    event: "contact-form",
    preheader: `New message from ${message.name}`,
    bodyHtml: `
      <p>New contact form submission from <strong>${message.name}</strong> (${message.email}):</p>
      <blockquote style="margin:16px 0;padding:12px 16px;background:#f6f3ee;border-left:3px solid #154212;border-radius:8px;">
        ${message.message}
      </blockquote>
    `,
    ctaLabel: "Reply by Email",
    ctaHref: `mailto:${message.email}`,
    link: `${APP_URL}/admin/messages?highlight=message-${message.id}`,
  });
}

export async function notifyLowStock(product: { id: number | string; name: string; stock: number }) {
  const href = `${APP_URL}/admin/products/new?id=${product.id}&highlight=product-${product.id}`;
  await notify({
    event: "low-stock",
    preheader: `${product.name} is running low`,
    bodyHtml: `
      <p><strong>${product.name}</strong> is running low — only ${product.stock} left in stock.</p>
      <p>Restock or mark it unavailable in the admin panel.</p>
    `,
    ctaLabel: "Manage Product",
    ctaHref: href,
    link: href,
  });
}
