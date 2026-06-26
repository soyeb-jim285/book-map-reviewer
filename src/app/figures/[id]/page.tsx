import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/chrome";
import { FigureReviewForm } from "@/components/review-form";
import { StatusBadge } from "@/components/status-badge";
import { getFigure, getFigures } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailNav } from "@/components/detail-nav";
import { matchesNavScope, NavScopeChooser, normalizeNavScope, scopedHref } from "@/components/nav-scope";

export const dynamic = "force-dynamic";

export default async function FigureDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ scope?: string }> }) {
  const { id } = await params;
  const { scope } = await searchParams;
  const [item, all] = await Promise.all([getFigure(id), getFigures()]);
  if (!item) notFound();
  const navScope = normalizeNavScope(scope);
  const scopedItems = all.filter((entry) => matchesNavScope(entry.review.status, navScope));
  const index = scopedItems.findIndex((entry) => entry.id === id);
  const prev = scopedItems[index - 1];
  const next = scopedItems[index + 1];
  const originalSrc = `/api/assets/${item.originalImageKey}`;
  const redrawnSrc = `/api/assets/${item.redrawnSvgKey ?? item.redrawnPngKey}`;

  return (
    <AppShell>
      <PageHeader eyebrow={item.sourceLabel} title={`Fig ${item.figureNumber}: ${item.figureKey}`} description="Compare the original cropped figure with the rendered TikZ redraw." actions={<><Button asChild variant="secondary"><Link href="/figures">Back</Link></Button>{prev ? <Button asChild variant="secondary"><Link href={scopedHref(`/figures/${prev.id}`, navScope)}>Previous</Link></Button> : null}{next ? <Button asChild><Link href={scopedHref(`/figures/${next.id}`, navScope)}>Next</Link></Button> : null}</>} />
      <NavScopeChooser currentScope={navScope} basePath={`/figures/${item.id}`} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="grid items-start gap-4 lg:grid-cols-2">
          <ImagePanel title="Original crop" src={originalSrc} />
          <ImagePanel title="Rendered TikZ" src={redrawnSrc} />
        </section>
        <aside className="space-y-4">
          <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Metadata</CardTitle><StatusBadge status={item.review.status} /></div></CardHeader><CardContent><dl className="space-y-2 text-sm"><Info label="Question" value={item.questionLabel} /><Info label="TikZ source" value={item.tikzSourcePath} /><Info label="Original key" value={item.originalImageKey} /><Info label="Redrawn key" value={item.redrawnSvgKey ?? item.redrawnPngKey} /></dl></CardContent></Card>
          <FigureReviewForm figureId={item.id} initial={item.review} />
        </aside>
      </div>
      <DetailNav backHref="/figures" previousHref={prev ? scopedHref(`/figures/${prev.id}`, navScope) : undefined} nextHref={next ? scopedHref(`/figures/${next.id}`, navScope) : undefined} previousLabel={prev ? `Fig ${prev.figureNumber}` : "Previous"} nextLabel={next ? `Fig ${next.figureNumber}` : "Next"} />
    </AppShell>
  );
}

function ImagePanel({ title, src }: { title: string; src: string }) {
  return <Card className="max-w-full justify-self-start overflow-hidden"><div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3"><CardTitle className="text-base">{title}</CardTitle><Button asChild variant="ghost" size="sm"><a href={src} target="_blank">Open</a></Button></div><div className="overflow-auto bg-stone-100 p-2"><img src={src} alt={title} className="block h-auto max-w-full rounded-xl bg-white shadow-sm" /></div></Card>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-stone-500">{label}</dt><dd className="mt-1 break-words rounded-xl bg-stone-50 p-2 font-semibold text-stone-700">{value}</dd></div>;
}
