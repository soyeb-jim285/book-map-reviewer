import { getFigures } from "@/lib/data";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const rows = (await getFigures()).map((item) => ({
    id: item.id,
    figure_number: item.figureNumber,
    figure_key: item.figureKey,
    source_label: item.sourceLabel,
    question_label: item.questionLabel,
    original_image_key: item.originalImageKey,
    redrawn_svg_key: item.redrawnSvgKey,
    redrawn_png_key: item.redrawnPngKey,
    tikz_source_path: item.tikzSourcePath,
    review_status: item.review.status,
    issue_tags: item.review.issueTags,
    review_note: item.review.note,
    last_reviewed_at: item.review.updatedAt,
  }));

  return csvResponse("figure-reviews.csv", toCsv(rows, Object.keys(rows[0] ?? { id: "" }) as (keyof (typeof rows)[number])[]));
}
