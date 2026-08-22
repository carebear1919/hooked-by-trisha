import { getPayloadClient } from "@/lib/payload";
import { getVisibleSocialLinks } from "@/lib/social-links";
import ContactForm from "./ContactForm";

export default async function ContactPage() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const socialLinks = getVisibleSocialLinks(settings.social);

  return (
    <ContactForm
      contactEmail={settings.contactEmail || "hello@example.com"}
      socialLinks={socialLinks}
    />
  );
}
