import "server-only";

const COLORS = {
  cream: "#fcf9f4",
  surfaceLow: "#f6f3ee",
  card: "#ffffff",
  primary: "#154212",
  onPrimary: "#ffffff",
  terracotta: "#5e2a16",
  ink: "#1c1c19",
  inkVariant: "#42493e",
  outline: "#e5e2dd",
};

export function renderEmailLayout({
  preheader = "",
  heading,
  bodyHtml,
  ctaLabel,
  ctaHref,
}: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.surfaceLow};font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:${COLORS.surfaceLow};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${preheader}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.surfaceLow};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${COLORS.card};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${COLORS.cream};padding:28px 40px;border-bottom:1px solid ${COLORS.outline};">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:${COLORS.primary};">
                  🌿 Handmade Crochet Co.
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${COLORS.ink};font-weight:600;">
                  ${heading}
                </h1>
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.inkVariant};">
                  ${bodyHtml}
                </div>
                ${
                  ctaLabel && ctaHref
                    ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:999px;background-color:${COLORS.primary};">
                      <a href="${ctaHref}" style="display:inline-block;padding:14px 32px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.02em;color:${COLORS.onPrimary};text-decoration:none;border-radius:999px;">
                        ${ctaLabel}
                      </a>
                    </td>
                  </tr>
                </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background-color:${COLORS.cream};border-top:1px solid ${COLORS.outline};">
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.terracotta};">
                  Handmade with love in the Philippines
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
