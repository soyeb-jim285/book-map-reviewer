# Control Review Desk

Next.js review dashboard for Control Engineering textbook mappings and TikZ figure redraw checks.

## Features

- Book mapping review from `Questions/outputs/question_book_map.tex`
- Exact PDF page viewing through private Cloudflare R2 signed URLs
- Figure comparison review from `Questions/outputs/comparison.tex`
- Original cropped image vs rendered TikZ image workflow
- Neon Postgres persistence through Drizzle ORM
- Status, notes, corrected references, and figure issue tags
- CSV exports for book reviews, figure reviews, and all reviews
- Local preview fallback before database migration/seed

## Setup

1. Copy `.env.example` to `.env.local` and fill in Neon + R2 credentials.
2. Run `npm install`.
3. Run `npm run db:migrate` to create Neon tables.
4. Run `npm run seed` to import the LaTeX mapping and comparison rows.
5. Run `npm run render:figures` to render TikZ figures into `public/review-assets`.
6. Run `npm run upload:assets` to upload books and figure images to R2.
7. Run `npm run dev`.

## R2 Keys

Default book keys:

```text
books/nise-6th.pdf
books/dazzo-5th.pdf
books/nise-solutions.pdf
```

Figure keys:

```text
figures/original/<figure-key>.png
figures/redrawn-svg/<figure-key>.svg
figures/redrawn-png/<figure-key>.png
```

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run seed
npm run render:figures
npm run upload:assets
npm run check:assets
```

## Notes

- The app uses actual local shadcn/ui-style components under `src/components/ui`.
- R2 objects are private; browser access goes through `/api/assets/...`, which redirects to signed URLs.
- If `DATABASE_URL` exists but tables are not migrated yet, pages fall back to parsing the local LaTeX files so builds still work.
