import { AppShell, PageHeader } from "@/components/chrome";
import { BookMapBrowser } from "@/components/book-map-browser";
import { getBookMaps } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default async function BookMapsPage() {
  const items = await getBookMaps();
  return <AppShell><PageHeader eyebrow="Textbook verification" title="Book mappings" description="Filter by status, match type, and topic. Open an item to view the cited page and save notes." actions={<Button asChild><a href="/api/export/book-maps">Download CSV</a></Button>} /><BookMapBrowser items={items} /></AppShell>;
}
