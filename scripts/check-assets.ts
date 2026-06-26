import { loadEnv } from "../src/lib/load-env";
import { defaultBooks, parseBookMap, parseFigureComparison } from "../src/lib/parse";
import { assetExists } from "../src/lib/r2";

async function main() {
  loadEnv();
  const keys = [
    ...defaultBooks.map((book) => book.r2Key),
    ...parseFigureComparison().flatMap((figure) => [figure.originalImageKey, figure.redrawnSvgKey, figure.redrawnPngKey].filter(Boolean) as string[]),
    ...parseBookMap().flatMap((mapping) => mapping.questionPreviewKeys ?? []),
  ];
  let missing = 0;
  for (const key of keys) {
    const exists = await assetExists(key);
    if (!exists) {
      missing += 1;
      console.warn(`Missing ${key}`);
    }
  }
  console.log(`${keys.length - missing}/${keys.length} assets available.`);
  if (missing) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
