import { AppShell, PageHeader } from "@/components/chrome";
import { FigureBrowser } from "@/components/figure-browser";
import { getFigures } from "@/lib/data";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FiguresPage() {
  const items = await getFigures();
  return <AppShell><PageHeader eyebrow="TikZ verification" title="Figure comparisons" description="Review cropped originals against rendered TikZ redrafts. Tag visual errors and export all comments." actions={<Button asChild><a href="/api/export/figures">Download CSV</a></Button>} /><FigureBrowser items={items} /></AppShell>;
}
