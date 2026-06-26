import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import { figureReviews } from "@/db/schema";

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "DATABASE_URL is required to save reviews" }, { status: 503 });
  const body = await request.json();
  const figureId = String(body.figureId ?? "");
  if (!figureId) return NextResponse.json({ error: "figureId is required" }, { status: 400 });

  const values = {
    figureId,
    status: body.status ?? "unverified",
    issueTags: Array.isArray(body.issueTags) ? body.issueTags : [],
    note: body.note ?? "",
    updatedAt: new Date(),
  };

  const db = getDb();
  await db
    .insert(figureReviews)
    .values(values)
    .onConflictDoUpdate({ target: figureReviews.figureId, set: values });

  const [review] = await db.select().from(figureReviews).where(eq(figureReviews.figureId, figureId));
  return NextResponse.json({ review });
}
