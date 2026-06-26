import Link from "next/link";
import { BookOpenCheck, Download, GalleryHorizontalEnd, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f6f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-stone-950 text-sm font-black text-amber-300">CE</span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.22em] text-stone-500">Control</span>
              <span className="block text-lg font-black leading-4">Review Desk</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
            <NavLink href="/" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
            <NavLink href="/book-maps" icon={<BookOpenCheck className="size-4" />} label="Book Maps" />
            <NavLink href="/figures" icon={<GalleryHorizontalEnd className="size-4" />} label="Figures" />
            <Button asChild variant="secondary" size="sm"><a href="/api/export/all">
              <span className="inline-flex items-center gap-2"><Download className="size-4" /> CSV</span>
            </a></Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Button asChild variant="ghost" size="sm"><Link href={href}>
      {icon}
      {label}
    </Link></Button>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <Card className="mb-6 flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <Card className="border-dashed border-stone-300 p-8 text-center"><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-stone-600">{description}</p></Card>;
}
