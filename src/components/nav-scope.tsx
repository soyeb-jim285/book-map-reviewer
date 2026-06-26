import Link from "next/link";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const scopes = [
  { value: "all", label: "All" },
  { value: "not_verified", label: "Not verified" },
  { value: "unverified", label: "Unverified" },
  { value: "needs_review", label: "Needs review" },
  { value: "incorrect", label: "Incorrect" },
  { value: "unclear", label: "Unclear" },
  { value: "verified", label: "Verified" },
  { value: "exclude_unverified", label: "Exclude unverified" },
  { value: "exclude_needs_review", label: "Exclude needs review" },
  { value: "exclude_incorrect", label: "Exclude incorrect" },
  { value: "exclude_unclear", label: "Exclude unclear" },
  { value: "exclude_verified", label: "Exclude verified" },
];

export function normalizeNavScope(scope?: string) {
  return scopes.some((item) => item.value === scope) ? scope! : "all";
}

export function scopedHref(base: string, scope: string) {
  return scope === "all" ? base : `${base}?scope=${scope}`;
}

export function matchesNavScope(status: string, scope: string) {
  if (scope === "all") return true;
  if (scope === "not_verified") return status !== "verified";
  if (scope.startsWith("exclude_")) return status !== scope.replace("exclude_", "");
  return status === scope;
}

export function NavScopeChooser({ currentScope, basePath }: { currentScope: string; basePath: string }) {
  return (
    <Card className="mb-5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">Navigation scope</p>
          <p className="mt-1 text-sm text-stone-600">Previous/Next can include only a status or exclude a selected status.</p>
        </div>
        <form action={basePath} className="flex flex-wrap items-center gap-2">
          <select
            name="scope"
            defaultValue={currentScope}
            className="h-10 min-w-44 rounded-full border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 outline-none focus:border-stone-950"
          >
            {scopes.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
          </select>
          <Button type="submit" size="sm">Apply</Button>
          {currentScope !== "all" ? <Button asChild size="sm" variant="secondary"><Link href={basePath}>Clear</Link></Button> : null}
        </form>
      </div>
    </Card>
  );
}
