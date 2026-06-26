"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { BookMapItem, ReviewStatus } from "@/lib/types";
import { MatchBadge, StatusBadge } from "./status-badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function BookMapBrowser({ items }: { items: BookMapItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "all">("all");
  const [match, setMatch] = useState("all");
  const deferredQuery = useDeferredValue(query.toLowerCase());
  const sections = [...new Set(items.map((item) => item.section))];
  const [section, setSection] = useState("all");

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.source} ${item.section} ${item.reference} ${item.evidence} ${item.bookTitle ?? ""}`.toLowerCase();
    return (!deferredQuery || haystack.includes(deferredQuery)) &&
      (status === "all" || item.review.status === status) &&
      (match === "all" || item.matchType === match) &&
      (section === "all" || item.section === section);
  }), [items, deferredQuery, status, match, section]);

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 p-4 md:grid-cols-4">
        <Input className="md:col-span-2" placeholder="Search source, evidence, reference..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onValueChange={(value) => setStatus(value as ReviewStatus | "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["all", "unverified", "verified", "needs_review", "incorrect", "unclear"].map((value) => <SelectItem key={value} value={value}>{value.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={match} onValueChange={setMatch}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["all", "exact", "close", "similar", "topic"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
        <div className="md:col-span-4"><Select value={section} onValueChange={setSection}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["all", ...sections].map((value) => <SelectItem key={value} value={value}>{value === "all" ? "All sections" : value}</SelectItem>)}</SelectContent></Select></div>
      </Card>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Preview</TableHead><TableHead>Question</TableHead><TableHead>Status</TableHead><TableHead>Reference</TableHead><TableHead>Page</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="cursor-pointer">
                <TableCell className="w-48"><Link href={`/book-maps/${item.id}`} className="block"><QuestionPreview item={item} /></Link></TableCell>
                <TableCell><Link href={`/book-maps/${item.id}`} className="block"><strong>{item.source}</strong><span className="mt-1 block text-xs text-stone-500">{item.section}</span></Link></TableCell>
                <TableCell><Link href={`/book-maps/${item.id}`} className="flex flex-col items-start gap-1"><StatusBadge status={item.review.status} /><MatchBadge match={item.matchType} /></Link></TableCell>
                <TableCell><Link href={`/book-maps/${item.id}`} className="line-clamp-2 text-stone-700">{item.reference}</Link></TableCell>
                <TableCell><Link href={`/book-maps/${item.id}`} className="font-bold">PDF {item.pdfPage ?? "-"}</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function QuestionPreview({ item }: { item: BookMapItem }) {
  const key = item.questionPreviewKeys?.[0] ?? item.questionPreviewKey;
  if (!key) {
    return <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-3 text-center text-xs font-bold text-stone-400">No preview</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      <div className="grid h-24 place-items-center overflow-hidden p-2">
        <img src={`/api/assets/${key}`} alt={`Question preview for ${item.source}`} className="max-h-full max-w-full object-contain" loading="lazy" />
      </div>
      {(item.questionPreviewKeys?.length ?? 0) > 1 ? <div className="border-t border-stone-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-stone-500">+{(item.questionPreviewKeys?.length ?? 1) - 1} more</div> : null}
    </div>
  );
}
