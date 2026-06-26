import Link from "next/link";
import { ArrowLeft, ArrowRight, List } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function DetailNav({
  backHref,
  previousHref,
  nextHref,
  previousLabel = "Previous",
  nextLabel = "Next",
}: {
  backHref: string;
  previousHref?: string;
  nextHref?: string;
  previousLabel?: string;
  nextLabel?: string;
}) {
  return (
    <Card className="sticky bottom-4 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 border-stone-300/80 bg-white/95 p-3 shadow-lg backdrop-blur">
      <Button asChild variant="secondary">
        <Link href={backHref}>
          <List className="size-4" />
          List
        </Link>
      </Button>
      <div className="flex flex-1 justify-end gap-2">
        {previousHref ? (
          <Button asChild variant="secondary">
            <Link href={previousHref}>
              <ArrowLeft className="size-4" />
              {previousLabel}
            </Link>
          </Button>
        ) : null}
        {nextHref ? (
          <Button asChild>
            <Link href={nextHref}>
              {nextLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
