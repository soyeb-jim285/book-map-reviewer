import fs from "node:fs";
import path from "node:path";
import { BOOK_MAP_TEX, FIGURE_COMPARISON_TEX, FIGURES_DIR } from "./paths";
import type { BookMapItem, FigureItem, MatchType } from "./types";

function cleanTex(value: string) {
  return value
    .replace(/\\textasciicircum\{\}/g, "^")
    .replace(/\\_/g, "_")
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\{\\bfseries\\color\{[^}]+\}([^}]+)\}/g, "$1")
    .replace(/\\mt\{[^}]+\}\{([^}]+)\}/g, "$1")
    .replace(/\\textit\{([^}]+)\}/g, "$1")
    .replace(/\\texttt\{([^}]+)\}/g, "$1")
    .replace(/\\quad/g, " ")
    .replace(/---/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function stableId(prefix: string, value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return `${prefix}-${hash.toString(16)}`;
}

function splitLatexRow(line: string) {
  return line
    .replace(/\\\[2pt\]$/, "")
    .split(/(?<!\\)\s&\s/g)
    .map((part) => part.trim());
}

function parseMatchType(value: string): MatchType {
  const text = cleanTex(value).toLowerCase();
  if (text.includes("exact")) return "exact";
  if (text.includes("close")) return "close";
  if (text.includes("similar")) return "similar";
  if (text.includes("topic")) return "topic";
  return "none";
}

function parseBookShortName(reference: string) {
  if (/Nise/i.test(reference)) return "nise-6th";
  if (/D'?Azzo/i.test(reference)) return "dazzo-5th";
  return null;
}

function parsePages(value: string) {
  const cleaned = cleanTex(value);
  const printed = cleaned.match(/p\.(\d+)/i)?.[1];
  const pdf = cleaned.match(/PDF\s+(\d+)/i)?.[1];
  const solution = cleaned.match(/Sol PDF\s+(\d+)/i)?.[1];
  return {
    printedPage: printed ? Number(printed) : null,
    pdfPage: pdf ? Number(pdf) : printed ? Number(printed) : null,
    solutionPdfPage: solution ? Number(solution) : null,
  };
}

export function parseBookMap(texPath = BOOK_MAP_TEX): BookMapItem[] {
  const text = fs.readFileSync(texPath, "utf8");
  const rows: BookMapItem[] = [];
  let section = "Uncategorized";

  for (const rawLine of text.split(/\r?\n/)) {
    const sectionMatch = rawLine.match(/\\clearpage\\section\{(.+)\}/);
    if (sectionMatch) {
      section = cleanTex(sectionMatch[1]);
      continue;
    }

    if (!rawLine.includes("\\mt") && !rawLine.includes("& — &")) continue;
    const parts = splitLatexRow(rawLine);
    if (parts.length < 5 || parts[0].includes("textbf")) continue;

    const source = cleanTex(parts[0]);
    const reference = cleanTex(parts[2]);
    const pages = parsePages(parts[3]);
    rows.push({
      id: stableId("book", `${source}|${section}|${reference}|${parts[3]}`),
      source,
      section,
      matchType: parseMatchType(parts[1]),
      bookShortName: parseBookShortName(reference),
      reference,
      ...pages,
      evidence: cleanTex(parts.slice(4).join(" & ")),
      review: { status: "unverified", note: "" },
    });
  }

  return rows;
}

export function parseFigureComparison(texPath = FIGURE_COMPARISON_TEX): FigureItem[] {
  const text = fs.readFileSync(texPath, "utf8");
  const rows: FigureItem[] = [];

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/Fig~(\d+)\}.*?\{\\scriptsize\s+([^}]+)\}\\par\\scriptsize\s+(.+?)\s+&.*?\\includegraphics\{figures\/orig\/([^}]+)\}.*?\\input\{figures\/([^}]+)\}/);
    if (!match) continue;

    const figureNumber = Number(match[1]);
    const figureKey = cleanTex(match[2]);
    const sourceLabel = cleanTex(match[3]);
    const originalFile = cleanTex(match[4]);
    const tikzInput = cleanTex(match[5]);

    rows.push({
      id: stableId("figure", `${figureNumber}|${figureKey}`),
      figureNumber,
      figureKey,
      sourceLabel,
      questionLabel: sourceLabel.replace(/^\S+\s*/, "") || sourceLabel,
      originalImageKey: `figures/original/${path.basename(originalFile)}`,
      redrawnSvgKey: `figures/redrawn-svg/${figureKey}.svg`,
      redrawnPngKey: `figures/redrawn-png/${figureKey}.png`,
      tikzSourcePath: path.join(FIGURES_DIR, `${tikzInput}.tex`),
      review: { status: "unverified", issueTags: [], note: "" },
    });
  }

  return rows;
}

export const defaultBooks = [
  {
    shortName: "nise-6th",
    title: "Control Systems Engineering by Nise",
    edition: "6th",
    r2Key: "books/nise-6th.pdf",
    localCandidates: ["Control Systems Engineering 6th (N. S. Nise).pdf"],
  },
  {
    shortName: "dazzo-5th",
    title: "Linear Control System Analysis and Design",
    edition: "5th",
    r2Key: "books/dazzo-5th.pdf",
    localCandidates: ["Linear Control System Analysis and Design Fifth Edition.pdf"],
  },
  {
    shortName: "nise-solutions",
    title: "Nise Solutions Manual",
    edition: null,
    r2Key: "books/nise-solutions.pdf",
    localCandidates: ["Nise-Solution.pdf"],
  },
];
