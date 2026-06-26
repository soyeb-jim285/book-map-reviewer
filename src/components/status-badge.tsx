import type { MatchType, ReviewStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { Badge } from "./ui/badge";

const statusStyles: Record<ReviewStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  unverified: "default",
  verified: "success",
  needs_review: "warning",
  incorrect: "danger",
  unclear: "info",
};

const matchStyles: Record<MatchType, React.ComponentProps<typeof Badge>["variant"]> = {
  exact: "success",
  close: "info",
  similar: "warning",
  topic: "outline",
  none: "outline",
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge variant={statusStyles[status]}>{titleCase(status)}</Badge>;
}

export function MatchBadge({ match }: { match: MatchType }) {
  return <Badge variant={matchStyles[match]}>{titleCase(match)}</Badge>;
}
