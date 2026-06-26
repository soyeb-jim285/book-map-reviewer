import path from "node:path";

export const PROJECT_ROOT = path.resolve(process.cwd(), "..");
export const QUESTIONS_OUTPUTS_DIR = path.join(PROJECT_ROOT, "Questions", "outputs");
export const BOOK_MAP_TEX = path.join(QUESTIONS_OUTPUTS_DIR, "question_book_map.tex");
export const FIGURE_COMPARISON_TEX = path.join(QUESTIONS_OUTPUTS_DIR, "comparison.tex");
export const FIGURES_DIR = path.join(QUESTIONS_OUTPUTS_DIR, "figures");
export const BOOKS_DIR = path.join(PROJECT_ROOT, "Books");
