import { NextRequest, NextResponse } from "next/server";
import { getAssetSignedUrl, hasR2 } from "@/lib/r2";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const assetKey = key.join("/");

  if (!assetKey) return NextResponse.json({ error: "Missing asset key" }, { status: 400 });
  if (!hasR2()) return NextResponse.json({ error: "R2 is not configured yet" }, { status: 503 });

  const signedUrl = await getAssetSignedUrl(assetKey);
  return NextResponse.redirect(signedUrl);
}
