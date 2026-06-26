import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/chrome";
import { MatchBadge, StatusBadge } from "@/components/status-badge";
import { BookReviewForm } from "@/components/review-form";
import { getBookMap, getBookMaps } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BookMapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, all] = await Promise.all([getBookMap(id), getBookMaps()]);
  if (!item) notFound();
  const index = all.findIndex((entry) => entry.id === id);
  const prev = all[index - 1];
  const next = all[index + 1];
  const pdfSrc = item.bookR2Key ? `/api/assets/${item.bookR2Key}#page=${item.pdfPage ?? 1}` : null;

  return (
    <AppShell>
      <PageHeader eyebrow={item.section} title={item.source} description={item.reference} actions={<><Button asChild variant="secondary"><Link href="/book-maps">Back</Link></Button>{prev ? <Button asChild variant="secondary"><Link href={`/book-maps/${prev.id}`}>Previous</Link></Button> : null}{next ? <Button asChild><Link href={`/book-maps/${next.id}`}>Next</Link></Button> : null}</>} />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="min-h-[72vh] overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.review.status} /><MatchBadge match={item.matchType} /><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold">PDF page {item.pdfPage ?? "-"}</span></div>
            {pdfSrc ? <Button asChild variant="ghost" size="sm"><a href={pdfSrc} target="_blank">Open PDF</a></Button> : null}
          </div>
          {pdfSrc ? <iframe title="Book PDF" className="h-[72vh] w-full bg-stone-100" src={pdfSrc} /> : <div className="grid h-[72vh] place-items-center p-8 text-center text-stone-500">No R2 key is available for this mapping.</div>}
        </Card>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Evidence</CardTitle></CardHeader>
            <CardContent><p className="rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-stone-800">{item.evidence}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Book" value={item.bookTitle ?? item.bookShortName ?? "None"} />
              <Info label="Printed" value={item.printedPage ?? "-"} />
              <Info label="PDF" value={item.pdfPage ?? "-"} />
              <Info label="Solution" value={item.solutionPdfPage ?? "-"} />
            </dl></CardContent>
          </Card>
          <BookReviewForm mappingId={item.id} initial={item.review} />
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-stone-50 p-3"><dt className="text-xs font-black uppercase tracking-wide text-stone-500">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>;
}
