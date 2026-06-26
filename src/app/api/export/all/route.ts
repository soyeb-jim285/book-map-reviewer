import { getBookMaps, getFigures } from "@/lib/data";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const bookRows = (await getBookMaps()).map((item) => ({
    type: "book_map",
    id: item.id,
    label: item.source,
    subject: item.reference,
    status: item.review.status,
    note: item.review.note,
    issue_tags: "",
    corrected_reference: item.review.correctedReference ?? "",
    updated_at: item.review.updatedAt ?? "",
  }));
  const figureRows = (await getFigures()).map((item) => ({
    type: "figure",
    id: item.id,
    label: `Fig ${item.figureNumber}`,
    subject: item.sourceLabel,
    status: item.review.status,
    note: item.review.note,
    issue_tags: item.review.issueTags,
    corrected_reference: "",
    updated_at: item.review.updatedAt ?? "",
  }));

  const rows = [...bookRows, ...figureRows];
  return csvResponse("all-reviews.csv", toCsv(rows, Object.keys(rows[0] ?? { type: "" }) as (keyof (typeof rows)[number])[]));
}
