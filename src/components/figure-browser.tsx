"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { FigureItem, ReviewStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function FigureBrowser({ items }: { items: FigureItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "all">("all");
  const deferredQuery = useDeferredValue(query.toLowerCase());
  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.figureNumber} ${item.figureKey} ${item.sourceLabel} ${item.questionLabel}`.toLowerCase();
    return (!deferredQuery || haystack.includes(deferredQuery)) && (status === "all" || item.review.status === status);
  }), [items, deferredQuery, status]);

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 p-4 md:grid-cols-3">
        <Input className="md:col-span-2" placeholder="Search figure key, question, source..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onValueChange={(value) => setStatus(value as ReviewStatus | "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(["all", "unverified", "verified", "needs_review", "incorrect", "unclear"] as const).map((item) => <SelectItem key={item} value={item}>{item.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Link key={item.id} href={`/figures/${item.id}`}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid grid-cols-2 gap-2 border-b border-stone-100 p-3">
              <PreviewImage title="Original" src={`/api/assets/${item.originalImageKey}`} />
              <PreviewImage title="Redrawn" src={`/api/assets/${item.redrawnSvgKey ?? item.redrawnPngKey}`} />
            </div>
            <CardHeader><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-stone-500">Fig {item.figureNumber}</p><CardTitle className="mt-1 text-lg">{item.figureKey}</CardTitle></div><StatusBadge status={item.review.status} /></div></CardHeader>
            <CardContent><p className="text-sm text-stone-600">{item.sourceLabel}</p>
            {item.review.issueTags.length ? <p className="mt-3 text-xs font-bold text-amber-700">{item.review.issueTags.join(", ")}</p> : null}
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PreviewImage({ title, src }: { title: string; src: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      <div className="border-b border-stone-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-stone-500">{title}</div>
      <div className="grid h-32 place-items-center overflow-hidden p-2">
        <img src={src} alt={`${title} preview`} className="max-h-full max-w-full object-contain" loading="lazy" />
      </div>
    </div>
  );
}
