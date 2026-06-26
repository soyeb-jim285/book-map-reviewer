"use client";

import { useState, useTransition } from "react";
import type { ReviewStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const statuses: ReviewStatus[] = ["verified", "needs_review", "incorrect", "unclear", "unverified"];

export function BookReviewForm({
  mappingId,
  initial,
}: {
  mappingId: string;
  initial: { status: ReviewStatus; note: string; correctedBook?: string | null; correctedReference?: string | null; correctedPrintedPage?: number | null; correctedPdfPage?: number | null };
}) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save(next = form) {
    startTransition(async () => {
      const response = await fetch("/api/reviews/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mappingId, ...next }),
      });
      setMessage(response.ok ? "Saved" : "Add DATABASE_URL and run migrations to save");
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Your Review</CardTitle></CardHeader>
      <CardContent>
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button key={status} variant={form.status === status ? "default" : "secondary"} size="sm" onClick={() => { const next = { ...form, status }; setForm(next); save(next); }}>{titleCase(status)}</Button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-bold text-stone-700">Notes</label>
      <Textarea className="mt-2" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="What is wrong, what page is better, or what to recheck?" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <FieldInput label="Corrected book" value={form.correctedBook ?? ""} onChange={(value) => setForm({ ...form, correctedBook: value })} />
        <FieldInput label="Corrected reference" value={form.correctedReference ?? ""} onChange={(value) => setForm({ ...form, correctedReference: value })} />
        <FieldInput label="Corrected printed page" value={form.correctedPrintedPage?.toString() ?? ""} onChange={(value) => setForm({ ...form, correctedPrintedPage: value ? Number(value) : null })} />
        <FieldInput label="Corrected PDF page" value={form.correctedPdfPage?.toString() ?? ""} onChange={(value) => setForm({ ...form, correctedPdfPage: value ? Number(value) : null })} />
      </div>
      <Button onClick={() => save()} disabled={pending} variant="accent" className="mt-4">{pending ? "Saving..." : "Save notes"}</Button>
      {message ? <p className="mt-2 text-sm font-semibold text-stone-500">{message}</p> : null}
      </CardContent>
    </Card>
  );
}

export function FigureReviewForm({ figureId, initial }: { figureId: string; initial: { status: ReviewStatus; note: string; issueTags: string[] } }) {
  const tags = ["label_missing", "wrong_label", "wrong_arrow", "wrong_connection", "wrong_block", "wrong_symbol", "layout_mismatch", "cropping_issue", "other"];
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save(next = form) {
    startTransition(async () => {
      const response = await fetch("/api/reviews/figure", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ figureId, ...next }),
      });
      setMessage(response.ok ? "Saved" : "Add DATABASE_URL and run migrations to save");
    });
  }

  function toggleTag(tag: string) {
    const issueTags = form.issueTags.includes(tag) ? form.issueTags.filter((item) => item !== tag) : [...form.issueTags, tag];
    const next = { ...form, issueTags };
    setForm(next);
    save(next);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Figure Review</CardTitle></CardHeader>
      <CardContent>
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button key={status} variant={form.status === status ? "default" : "secondary"} size="sm" onClick={() => { const next = { ...form, status }; setForm(next); save(next); }}>{titleCase(status)}</Button>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-stone-700">Issue tags</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => <Button key={tag} type="button" variant={form.issueTags.includes(tag) ? "accent" : "secondary"} size="sm" onClick={() => toggleTag(tag)}>{titleCase(tag)}</Button>)}
      </div>
      <label className="mt-4 block text-sm font-bold text-stone-700">Notes</label>
      <Textarea className="mt-2" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Mention missing labels, wrong arrows, spacing, or anything to fix." />
      <Button onClick={() => save()} disabled={pending} variant="accent" className="mt-4">{pending ? "Saving..." : "Save notes"}</Button>
      {message ? <p className="mt-2 text-sm font-semibold text-stone-500">{message}</p> : null}
      </CardContent>
    </Card>
  );
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold text-stone-700">{label}<Input className="mt-1 rounded-xl" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
