// app/api/geo/reverse/route.ts
//
// Free reverse-geocoding endpoint. Takes lat/lng query params from the
// browser's Geolocation API and returns { city, state, country } using
// BigDataCloud's free reverse-geocode-client endpoint (no key needed, HTTPS,
// unlimited for reasonable use). Falls back to OpenStreetMap Nominatim.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface ReverseResult {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  source: "bigdatacloud" | "nominatim" | "failed";
  error?: string;
}

async function lookupBigDataCloud(
  lat: string,
  lng: string,
  lang = "en"
): Promise<ReverseResult | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SavinGroup/1.0" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city || data.locality || data.principalSubdivision || "",
      state: data.principalSubdivision || "",
      country: data.countryName || "",
      countryCode: (data.countryCode || "").toLowerCase(),
      source: "bigdatacloud",
    };
  } catch {
    return null;
  }
}

async function lookupNominatim(
  lat: string,
  lng: string,
  lang = "en"
): Promise<ReverseResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}&zoom=10`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SavinGroup/1.0 (contact: savingroup@gmail.com)",
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        addr.county ||
        "",
      state: addr.state || addr.region || "",
      country: addr.country || "",
      countryCode: (addr.country_code || "").toLowerCase(),
      source: "nominatim",
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  const lang = sp.get("lang") || "en";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat/lng", source: "failed" } as ReverseResult,
      { status: 400 }
    );
  }

  // Try BigDataCloud first (faster, unlimited)
  const bdc = await lookupBigDataCloud(lat, lng, lang);
  if (bdc && bdc.city) {
    return NextResponse.json(bdc, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  }

  // Fallback: OpenStreetMap Nominatim
  const nom = await lookupNominatim(lat, lng, lang);
  if (nom && nom.city) {
    return NextResponse.json(nom, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  }

  return NextResponse.json(
    {
      city: "",
      state: "",
      country: "",
      countryCode: "",
      source: "failed",
      error: "All reverse-geocoding services failed",
    } as ReverseResult,
    { status: 502 }
  );
}
