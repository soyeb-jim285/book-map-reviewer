import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-28 w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-stone-950", className)} {...props} />;
}
