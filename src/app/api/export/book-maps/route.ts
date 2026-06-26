import { getBookMaps } from "@/lib/data";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const rows = (await getBookMaps()).map((item) => ({
    id: item.id,
    source: item.source,
    section: item.section,
    match_type: item.matchType,
    book: item.bookTitle ?? item.bookShortName ?? "",
    reference: item.reference,
    printed_page: item.printedPage,
    pdf_page: item.pdfPage,
    solution_pdf_page: item.solutionPdfPage,
    question_latex: item.questionLatex,
    evidence: item.evidence,
    review_status: item.review.status,
    review_note: item.review.note,
    corrected_book: item.review.correctedBook,
    corrected_reference: item.review.correctedReference,
    corrected_printed_page: item.review.correctedPrintedPage,
    corrected_pdf_page: item.review.correctedPdfPage,
    last_reviewed_at: item.review.updatedAt,
  }));

  return csvResponse("book-map-reviews.csv", toCsv(rows, Object.keys(rows[0] ?? { id: "" }) as (keyof (typeof rows)[number])[]));
}
