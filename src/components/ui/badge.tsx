import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold", {
  variants: {
    variant: {
      default: "border-stone-300 bg-stone-100 text-stone-700",
      success: "border-emerald-200 bg-emerald-100 text-emerald-800",
      warning: "border-amber-200 bg-amber-100 text-amber-800",
      danger: "border-rose-200 bg-rose-100 text-rose-800",
      info: "border-sky-200 bg-sky-100 text-sky-800",
      outline: "border-stone-300 bg-white text-stone-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
