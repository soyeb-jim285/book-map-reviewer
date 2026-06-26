import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/chrome";
import { MatchBadge, StatusBadge } from "@/components/status-badge";
import { BookReviewForm } from "@/components/review-form";
import { getBookMap, getBookMaps } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailNav } from "@/components/detail-nav";

export const dynamic = "force-dynamic";

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
            <CardHeader><CardTitle>Original Question</CardTitle></CardHeader>
            <CardContent>
              {(item.questionPreviewKeys?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {item.questionPreviewKeys!.map((key, questionIndex) => (
                    <div key={key} className="overflow-auto rounded-2xl border border-stone-200 bg-stone-50 p-3">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-stone-500">Question part {questionIndex + 1}</p>
                      <img src={`/api/assets/${key}`} alt={`Rendered question ${questionIndex + 1} for ${item.source}`} className="max-w-full rounded-xl bg-white shadow-sm" />
                    </div>
                  ))}
                </div>
              ) : item.questionPreviewKey ? (
                <div className="overflow-auto rounded-2xl border border-stone-200 bg-stone-50 p-3"><img src={`/api/assets/${item.questionPreviewKey}`} alt={`Rendered question for ${item.source}`} className="max-w-full rounded-xl bg-white shadow-sm" /></div>
              ) : item.questionLatex ? (
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-50">{item.questionLatex}</pre>
              ) : (
                <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">No matching question text found in questions_by_topic.tex.</p>
              )}
              {item.questionLatex ? <details className="mt-3"><summary className="cursor-pointer text-sm font-black text-stone-600">Show raw LaTeX</summary><pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-50">{item.questionLatex}</pre></details> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Book Match</CardTitle></CardHeader>
            <CardContent>
            <div className="mb-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-700">
              <div className="mb-2 flex items-center gap-2"><MatchBadge match={item.matchType} /><strong>{matchDescription(item.matchType)}</strong></div>
              <p>{matchHelp(item.matchType)}</p>
            </div>
            <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-stone-800">{item.evidence}</p>
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
      <DetailNav backHref="/book-maps" previousHref={prev ? `/book-maps/${prev.id}` : undefined} nextHref={next ? `/book-maps/${next.id}` : undefined} previousLabel={prev?.source ?? "Previous"} nextLabel={next?.source ?? "Next"} />
    </AppShell>
  );
}

function matchDescription(matchType: string) {
  if (matchType === "exact") return "Exact source match";
  if (matchType === "close") return "Partial match: same problem with small changes";
  if (matchType === "similar") return "Partial match: same method/type";
  if (matchType === "topic") return "Topic-only reference";
  return "No direct book match";
}

function matchHelp(matchType: string) {
  if (matchType === "exact") return "The question appears to match the cited book source very closely or verbatim.";
  if (matchType === "close") return "Use this when the source problem is essentially the same but numbers, wording, or small details differ.";
  if (matchType === "similar") return "Use this when the cited book material teaches the same solution pattern, but it is not the same problem.";
  if (matchType === "topic") return "Use this when the citation only supports the topic/section, not a specific copied problem.";
  return "No reliable textbook source was mapped.";
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-stone-50 p-3"><dt className="text-xs font-black uppercase tracking-wide text-stone-500">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>;
}
