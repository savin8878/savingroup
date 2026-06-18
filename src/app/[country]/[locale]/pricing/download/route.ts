import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslation, type Locale } from "@/lib/i18n";
import { BASE_URL } from "@/lib/constants";
import { buildPricingDocument } from "./pricing-pdf";

// @react-pdf/renderer relies on Node APIs (not Edge), so pin the runtime.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string; locale: string }> },
) {
  const { locale } = await params;
  const t = getTranslation(locale as Locale);

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const website = BASE_URL.replace(/^https?:\/\//, "");

  const buffer = await renderToBuffer(
    buildPricingDocument({
      t,
      dateLabel,
      website,
      email: t.contact.details.emailHref,
      phone: t.contact.details.phone,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="sanat-dynamo-pricing.pdf"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
