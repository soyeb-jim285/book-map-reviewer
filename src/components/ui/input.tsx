import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("h-11 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-2 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-stone-950", className)} {...props} />;
}
