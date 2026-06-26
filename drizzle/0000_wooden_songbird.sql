CREATE TYPE "public"."match_type" AS ENUM('exact', 'close', 'similar', 'topic', 'none');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('unverified', 'verified', 'needs_review', 'incorrect', 'unclear');--> statement-breakpoint
CREATE TABLE "book_mapping_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mapping_id" uuid NOT NULL,
	"status" "review_status" DEFAULT 'unverified' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"corrected_book" text,
	"corrected_reference" text,
	"corrected_printed_page" integer,
	"corrected_pdf_page" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "book_mapping_reviews_mapping_id_unique" UNIQUE("mapping_id")
);
--> statement-breakpoint
CREATE TABLE "book_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"section" text NOT NULL,
	"match_type" "match_type" NOT NULL,
	"book_short_name" text,
	"book_id" uuid,
	"reference" text NOT NULL,
	"printed_page" integer,
	"pdf_page" integer,
	"solution_pdf_page" integer,
	"evidence" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_name" text NOT NULL,
	"title" text NOT NULL,
	"edition" text,
	"r2_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_short_name_unique" UNIQUE("short_name")
);
--> statement-breakpoint
CREATE TABLE "figure_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"figure_id" uuid NOT NULL,
	"status" "review_status" DEFAULT 'unverified' NOT NULL,
	"issue_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "figure_reviews_figure_id_unique" UNIQUE("figure_id")
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"figure_number" integer NOT NULL,
	"figure_key" text NOT NULL,
	"source_label" text NOT NULL,
	"question_label" text NOT NULL,
	"original_image_key" text NOT NULL,
	"redrawn_svg_key" text,
	"redrawn_png_key" text NOT NULL,
	"tikz_source_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "figures_figure_key_unique" UNIQUE("figure_key")
);
--> statement-breakpoint
ALTER TABLE "book_mapping_reviews" ADD CONSTRAINT "book_mapping_reviews_mapping_id_book_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."book_mappings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_mappings" ADD CONSTRAINT "book_mappings_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figure_reviews" ADD CONSTRAINT "figure_reviews_figure_id_figures_id_fk" FOREIGN KEY ("figure_id") REFERENCES "public"."figures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "book_mappings_source_reference_idx" ON "book_mappings" USING btree ("source","reference");