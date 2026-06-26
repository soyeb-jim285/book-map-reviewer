import { asc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import { books, bookMappingReviews, bookMappings, figureReviews, figures } from "@/db/schema";
import { defaultBooks, parseBookMap, parseFigureComparison } from "./parse";
import type { BookMapItem, FigureItem } from "./types";

const bookMeta = new Map(defaultBooks.map((book) => [book.shortName, book]));

function localBookMaps(): BookMapItem[] {
  return parseBookMap().map((item) => ({
    ...item,
    bookTitle: item.bookShortName ? bookMeta.get(item.bookShortName)?.title : null,
    bookR2Key: item.bookShortName ? bookMeta.get(item.bookShortName)?.r2Key : null,
  }));
}

export async function getBookMaps(): Promise<BookMapItem[]> {
  if (!hasDatabase()) {
    return localBookMaps();
  }

  let rows;
  try {
    const db = getDb();
    rows = await db
      .select({ mapping: bookMappings, review: bookMappingReviews, book: books })
      .from(bookMappings)
      .leftJoin(bookMappingReviews, eq(bookMappingReviews.mappingId, bookMappings.id))
      .leftJoin(books, eq(books.id, bookMappings.bookId))
      .orderBy(asc(bookMappings.section), asc(bookMappings.source));
  } catch (error) {
    console.warn("Falling back to local book-map data. Run migrations and seed to use Neon.", error);
    return localBookMaps();
  }

  return rows.map(({ mapping, review, book }) => ({
    id: mapping.id,
    source: mapping.source,
    section: mapping.section,
    matchType: mapping.matchType,
    bookShortName: mapping.bookShortName,
    bookTitle: book?.title ?? null,
    bookR2Key: book?.r2Key ?? (mapping.bookShortName ? bookMeta.get(mapping.bookShortName)?.r2Key : null) ?? null,
    reference: mapping.reference,
    printedPage: mapping.printedPage,
    pdfPage: mapping.pdfPage,
    solutionPdfPage: mapping.solutionPdfPage,
    evidence: mapping.evidence,
    review: review ?? { status: "unverified", note: "" },
  }));
}

export async function getBookMap(id: string) {
  return (await getBookMaps()).find((item) => item.id === id) ?? null;
}

export async function getFigures(): Promise<FigureItem[]> {
  if (!hasDatabase()) return parseFigureComparison();

  let rows;
  try {
    const db = getDb();
    rows = await db
      .select({ figure: figures, review: figureReviews })
      .from(figures)
      .leftJoin(figureReviews, eq(figureReviews.figureId, figures.id))
      .orderBy(asc(figures.figureNumber));
  } catch (error) {
    console.warn("Falling back to local figure data. Run migrations and seed to use Neon.", error);
    return parseFigureComparison();
  }

  return rows.map(({ figure, review }) => ({
    id: figure.id,
    figureNumber: figure.figureNumber,
    figureKey: figure.figureKey,
    sourceLabel: figure.sourceLabel,
    questionLabel: figure.questionLabel,
    originalImageKey: figure.originalImageKey,
    redrawnSvgKey: figure.redrawnSvgKey,
    redrawnPngKey: figure.redrawnPngKey,
    tikzSourcePath: figure.tikzSourcePath,
    review: review ?? { status: "unverified", issueTags: [], note: "" },
  }));
}

export async function getFigure(id: string) {
  return (await getFigures()).find((item) => item.id === id) ?? null;
}
