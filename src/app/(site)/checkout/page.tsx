import { getPayloadClient } from "@/lib/payload";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });

  const gcashQrCode = settings.payment?.gcashQrCode;
  const gcashQrCodeUrl =
    gcashQrCode && typeof gcashQrCode === "object" ? (gcashQrCode.url ?? null) : null;

  return (
    <CheckoutForm
      standardFee={settings.shipping?.standardFee ?? 150}
      freeShippingThreshold={settings.shipping?.freeShippingThreshold ?? null}
      pickupLocation={settings.shipping?.pickupLocation ?? ""}
      gcashNumber={settings.payment?.gcashNumber ?? ""}
      gcashQrCodeUrl={gcashQrCodeUrl}
      bpiAccountName={settings.payment?.bpiAccountName ?? ""}
      bpiAccountNumber={settings.payment?.bpiAccountNumber ?? ""}
    />
  );
}
