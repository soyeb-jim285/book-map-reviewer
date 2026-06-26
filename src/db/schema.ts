import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const matchTypeEnum = pgEnum("match_type", ["exact", "close", "similar", "topic", "none"]);
export const reviewStatusEnum = pgEnum("review_status", ["unverified", "verified", "needs_review", "incorrect", "unclear"]);

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortName: text("short_name").notNull().unique(),
  title: text("title").notNull(),
  edition: text("edition"),
  r2Key: text("r2_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookMappings = pgTable("book_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  section: text("section").notNull(),
  matchType: matchTypeEnum("match_type").notNull(),
  bookShortName: text("book_short_name"),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
  reference: text("reference").notNull(),
  printedPage: integer("printed_page"),
  pdfPage: integer("pdf_page"),
  solutionPdfPage: integer("solution_pdf_page"),
  evidence: text("evidence").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sourceReferenceIdx: uniqueIndex("book_mappings_source_reference_idx").on(table.source, table.reference),
}));

export const bookMappingReviews = pgTable("book_mapping_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  mappingId: uuid("mapping_id").notNull().references(() => bookMappings.id, { onDelete: "cascade" }).unique(),
  status: reviewStatusEnum("status").default("unverified").notNull(),
  note: text("note").default("").notNull(),
  correctedBook: text("corrected_book"),
  correctedReference: text("corrected_reference"),
  correctedPrintedPage: integer("corrected_printed_page"),
  correctedPdfPage: integer("corrected_pdf_page"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const figures = pgTable("figures", {
  id: uuid("id").primaryKey().defaultRandom(),
  figureNumber: integer("figure_number").notNull(),
  figureKey: text("figure_key").notNull().unique(),
  sourceLabel: text("source_label").notNull(),
  questionLabel: text("question_label").notNull(),
  originalImageKey: text("original_image_key").notNull(),
  redrawnSvgKey: text("redrawn_svg_key"),
  redrawnPngKey: text("redrawn_png_key").notNull(),
  tikzSourcePath: text("tikz_source_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const figureReviews = pgTable("figure_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  figureId: uuid("figure_id").notNull().references(() => figures.id, { onDelete: "cascade" }).unique(),
  status: reviewStatusEnum("status").default("unverified").notNull(),
  issueTags: jsonb("issue_tags").$type<string[]>().default([]).notNull(),
  note: text("note").default("").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookRelations = relations(books, ({ many }) => ({ mappings: many(bookMappings) }));
export const bookMappingRelations = relations(bookMappings, ({ one }) => ({
  book: one(books, { fields: [bookMappings.bookId], references: [books.id] }),
  review: one(bookMappingReviews),
}));
export const bookMappingReviewRelations = relations(bookMappingReviews, ({ one }) => ({
  mapping: one(bookMappings, { fields: [bookMappingReviews.mappingId], references: [bookMappings.id] }),
}));
export const figureRelations = relations(figures, ({ one }) => ({ review: one(figureReviews) }));
export const figureReviewRelations = relations(figureReviews, ({ one }) => ({
  figure: one(figures, { fields: [figureReviews.figureId], references: [figures.id] }),
}));
