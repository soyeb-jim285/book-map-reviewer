import { eq } from "drizzle-orm";
import { loadEnv } from "../src/lib/load-env";
import { getDb } from "../src/db";
import { books, bookMappings, figures } from "../src/db/schema";
import { defaultBooks, parseBookMap, parseFigureComparison } from "../src/lib/parse";

async function main() {
  loadEnv();
  const db = getDb();
  const bookIdByShortName = new Map<string, string>();

  for (const book of defaultBooks) {
    const [row] = await db
      .insert(books)
      .values({ shortName: book.shortName, title: book.title, edition: book.edition, r2Key: book.r2Key, updatedAt: new Date() })
      .onConflictDoUpdate({ target: books.shortName, set: { title: book.title, edition: book.edition, r2Key: book.r2Key, updatedAt: new Date() } })
      .returning();
    bookIdByShortName.set(book.shortName, row.id);
  }

  const mappings = parseBookMap();
  for (const item of mappings) {
    await db
      .insert(bookMappings)
      .values({
        source: item.source,
        section: item.section,
        matchType: item.matchType,
        bookShortName: item.bookShortName,
        bookId: item.bookShortName ? bookIdByShortName.get(item.bookShortName) ?? null : null,
        reference: item.reference,
        printedPage: item.printedPage,
        pdfPage: item.pdfPage,
        solutionPdfPage: item.solutionPdfPage,
        evidence: item.evidence,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [bookMappings.source, bookMappings.reference],
        set: {
          section: item.section,
          matchType: item.matchType,
          bookShortName: item.bookShortName,
          bookId: item.bookShortName ? bookIdByShortName.get(item.bookShortName) ?? null : null,
          printedPage: item.printedPage,
          pdfPage: item.pdfPage,
          solutionPdfPage: item.solutionPdfPage,
          evidence: item.evidence,
          updatedAt: new Date(),
        },
      });
  }

  const figureItems = parseFigureComparison();
  for (const item of figureItems) {
    await db
      .insert(figures)
      .values({
        figureNumber: item.figureNumber,
        figureKey: item.figureKey,
        sourceLabel: item.sourceLabel,
        questionLabel: item.questionLabel,
        originalImageKey: item.originalImageKey,
        redrawnSvgKey: item.redrawnSvgKey,
        redrawnPngKey: item.redrawnPngKey,
        tikzSourcePath: item.tikzSourcePath,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: figures.figureKey,
        set: {
          figureNumber: item.figureNumber,
          sourceLabel: item.sourceLabel,
          questionLabel: item.questionLabel,
          originalImageKey: item.originalImageKey,
          redrawnSvgKey: item.redrawnSvgKey,
          redrawnPngKey: item.redrawnPngKey,
          tikzSourcePath: item.tikzSourcePath,
          updatedAt: new Date(),
        },
      });
  }

  const [mappingCount] = await db.select().from(bookMappings).where(eq(bookMappings.source, mappings[0]?.source ?? ""));
  console.log(`Seeded ${mappings.length} book mappings and ${figureItems.length} figures.`);
  if (mappingCount) console.log("Database connection verified.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
