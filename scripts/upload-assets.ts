import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "../src/lib/load-env";
import { BOOKS_DIR, PROJECT_ROOT } from "../src/lib/paths";
import { defaultBooks, parseBookMap, parseFigureComparison } from "../src/lib/parse";
import { uploadAsset } from "../src/lib/r2";

function contentType(file: string) {
  if (file.endsWith(".pdf")) return "application/pdf";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

async function uploadFile(key: string, filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing: ${filePath}`);
    return false;
  }
  await uploadAsset(key, fs.readFileSync(filePath), contentType(filePath));
  console.log(`Uploaded ${key}`);
  return true;
}

async function main() {
  loadEnv();
  let uploaded = 0;
  for (const book of defaultBooks) {
    const local = book.localCandidates.map((candidate) => path.join(BOOKS_DIR, candidate)).find((candidate) => fs.existsSync(candidate));
    if (local && (await uploadFile(book.r2Key, local))) uploaded += 1;
  }

  for (const figure of parseFigureComparison()) {
    const original = path.join(PROJECT_ROOT, "Questions", "outputs", "figures", "orig", `${figure.figureKey}.png`);
    const redrawnSvg = path.join(process.cwd(), "public", "review-assets", "redrawn-svg", `${figure.figureKey}.svg`);
    const redrawnPng = path.join(process.cwd(), "public", "review-assets", "redrawn-png", `${figure.figureKey}.png`);
    if (await uploadFile(figure.originalImageKey, original)) uploaded += 1;
    if (figure.redrawnSvgKey && (await uploadFile(figure.redrawnSvgKey, redrawnSvg))) uploaded += 1;
    if (await uploadFile(figure.redrawnPngKey, redrawnPng)) uploaded += 1;
  }

  const uploadedQuestionKeys = new Set<string>();
  for (const mapping of parseBookMap()) {
    for (const key of mapping.questionPreviewKeys ?? []) {
      if (uploadedQuestionKeys.has(key)) continue;
      uploadedQuestionKeys.add(key);
      const local = path.join(process.cwd(), "public", "review-assets", key);
      if (await uploadFile(key, local)) uploaded += 1;
    }
  }

  console.log(`Uploaded ${uploaded} assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
