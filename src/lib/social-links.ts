export type SocialSettings =
  | {
      showSocialLinks?: boolean | null;
      instagram?: string | null;
      showInstagram?: boolean | null;
      facebook?: string | null;
      showFacebook?: boolean | null;
      tiktok?: string | null;
      showTiktok?: boolean | null;
    }
  | null
  | undefined;

export function getVisibleSocialLinks(social: SocialSettings): { href: string; label: string }[] {
  if (!(social?.showSocialLinks ?? true)) return [];
  return [
    { href: (social?.showInstagram ?? true) ? social?.instagram : null, label: "Instagram" },
    { href: (social?.showFacebook ?? true) ? social?.facebook : null, label: "Facebook" },
    { href: (social?.showTiktok ?? true) ? social?.tiktok : null, label: "TikTok" },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href));
}
