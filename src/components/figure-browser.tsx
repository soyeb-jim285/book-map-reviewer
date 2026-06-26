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
