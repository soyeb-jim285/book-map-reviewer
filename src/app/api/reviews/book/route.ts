import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import { bookMappingReviews } from "@/db/schema";

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "DATABASE_URL is required to save reviews" }, { status: 503 });
  const body = await request.json();
  const mappingId = String(body.mappingId ?? "");
  if (!mappingId) return NextResponse.json({ error: "mappingId is required" }, { status: 400 });

  const values = {
    mappingId,
    status: body.status ?? "unverified",
    note: body.note ?? "",
    correctedBook: body.correctedBook || null,
    correctedReference: body.correctedReference || null,
    correctedPrintedPage: body.correctedPrintedPage ? Number(body.correctedPrintedPage) : null,
    correctedPdfPage: body.correctedPdfPage ? Number(body.correctedPdfPage) : null,
    updatedAt: new Date(),
  };

  const db = getDb();
  await db
    .insert(bookMappingReviews)
    .values(values)
    .onConflictDoUpdate({ target: bookMappingReviews.mappingId, set: values });

  const [review] = await db.select().from(bookMappingReviews).where(eq(bookMappingReviews.mappingId, mappingId));
  return NextResponse.json({ review });
}
