import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/chrome";
import { FigureReviewForm } from "@/components/review-form";
import { StatusBadge } from "@/components/status-badge";
import { getFigure, getFigures } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailNav } from "@/components/detail-nav";

export const dynamic = "force-dynamic";

export default async function FigureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, all] = await Promise.all([getFigure(id), getFigures()]);
  if (!item) notFound();
  const index = all.findIndex((entry) => entry.id === id);
  const prev = all[index - 1];
  const next = all[index + 1];
  const originalSrc = `/api/assets/${item.originalImageKey}`;
  const redrawnSrc = `/api/assets/${item.redrawnSvgKey ?? item.redrawnPngKey}`;

  return (
    <AppShell>
      <PageHeader eyebrow={item.sourceLabel} title={`Fig ${item.figureNumber}: ${item.figureKey}`} description="Compare the original cropped figure with the rendered TikZ redraw." actions={<><Button asChild variant="secondary"><Link href="/figures">Back</Link></Button>{prev ? <Button asChild variant="secondary"><Link href={`/figures/${prev.id}`}>Previous</Link></Button> : null}{next ? <Button asChild><Link href={`/figures/${next.id}`}>Next</Link></Button> : null}</>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-4 lg:grid-cols-2">
          <ImagePanel title="Original crop" src={originalSrc} />
          <ImagePanel title="Rendered TikZ" src={redrawnSrc} />
        </section>
        <aside className="space-y-4">
          <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Metadata</CardTitle><StatusBadge status={item.review.status} /></div></CardHeader><CardContent><dl className="space-y-2 text-sm"><Info label="Question" value={item.questionLabel} /><Info label="TikZ source" value={item.tikzSourcePath} /><Info label="Original key" value={item.originalImageKey} /><Info label="Redrawn key" value={item.redrawnSvgKey ?? item.redrawnPngKey} /></dl></CardContent></Card>
          <FigureReviewForm figureId={item.id} initial={item.review} />
        </aside>
      </div>
      <DetailNav backHref="/figures" previousHref={prev ? `/figures/${prev.id}` : undefined} nextHref={next ? `/figures/${next.id}` : undefined} previousLabel={prev ? `Fig ${prev.figureNumber}` : "Previous"} nextLabel={next ? `Fig ${next.figureNumber}` : "Next"} />
    </AppShell>
  );
}

function ImagePanel({ title, src }: { title: string; src: string }) {
  return <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-stone-200 px-4 py-3"><CardTitle className="text-base">{title}</CardTitle><Button asChild variant="ghost" size="sm"><a href={src} target="_blank">Open</a></Button></div><div className="grid min-h-[68vh] place-items-center overflow-auto bg-stone-100 p-4"><img src={src} alt={title} className="max-h-none max-w-full rounded-xl bg-white shadow-sm" /></div></Card>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-stone-500">{label}</dt><dd className="mt-1 break-words rounded-xl bg-stone-50 p-2 font-semibold text-stone-700">{value}</dd></div>;
}
