import Link from "next/link";
import { AppShell, PageHeader } from "@/components/chrome";
import { getBookMaps, getFigures } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function Home() {
  const [bookMaps, figures] = await Promise.all([getBookMaps(), getFigures()]);
  const verifiedBooks = bookMaps.filter((item) => item.review.status === "verified").length;
  const verifiedFigures = figures.filter((item) => item.review.status === "verified").length;

  return (
    <AppShell>
      <PageHeader eyebrow="Verification workspace" title="Review faster, save everything" description="A focused dashboard for textbook page mappings and original-vs-redrawn figure checks. Add Neon/R2 credentials to make reviews persistent and assets available online." actions={<Button asChild><a href="/api/export/all">Download all CSV</a></Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Book mappings" value={bookMaps.length} sub={`${verifiedBooks} verified`} />
        <Stat label="Figures" value={figures.length} sub={`${verifiedFigures} verified`} />
        <Stat label="Need review" value={[...bookMaps, ...figures].filter((item) => item.review.status === "needs_review").length} sub="flagged items" />
        <Stat label="Incorrect" value={[...bookMaps, ...figures].filter((item) => item.review.status === "incorrect").length} sub="fix candidates" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Action href="/book-maps" title="Book mapping review" description="Open the exact PDF page from private R2, compare the evidence quote, and save corrected references." />
        <Action href="/figures" title="Figure redraw review" description="Compare cropped originals with rendered TikZ previews side by side, tag issues, and export comments." />
      </div>
    </AppShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return <Card><CardHeader><p className="text-sm font-bold text-stone-500">{label}</p><CardTitle className="text-4xl">{value}</CardTitle></CardHeader><CardContent><p className="text-sm text-stone-500">{sub}</p><Progress className="mt-3" value={value ? 60 : 0} /></CardContent></Card>;
}

function Action({ href, title, description }: { href: string; title: string; description: string }) {
  return <Link href={href}><Card className="h-full p-6 transition hover:-translate-y-0.5 hover:shadow-md"><CardTitle className="text-2xl">{title}</CardTitle><p className="mt-3 leading-7 text-stone-600">{description}</p></Card></Link>;
}
