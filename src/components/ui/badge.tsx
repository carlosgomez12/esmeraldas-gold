import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        gold: "border-gold-500/40 bg-gold-500/10 text-gold-700",
        ink: "border-ink-900/20 bg-ink-900 text-ivory-50",
        emerald: "border-esmerald-700/30 bg-esmerald-700/10 text-esmerald-800",
        ivory: "border-ink-900/15 bg-ivory-50 text-ink-700",
        outline: "border-ink-900/20 text-ink-700",
      },
    },
    defaultVariants: {
      variant: "ivory",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };