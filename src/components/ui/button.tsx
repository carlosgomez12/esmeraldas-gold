import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-900 text-ivory-50 hover:bg-ink-800 hover:shadow-lg hover:shadow-ink-900/20",
        gold: "bg-gold-500 text-ink-950 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/30",
        outline:
          "border border-ink-300/60 text-ink-900 hover:border-gold-500 hover:text-gold-700 bg-transparent",
        ghost: "text-ink-700 hover:bg-ink-900/5 hover:text-ink-950",
        link: "text-gold-700 underline-offset-4 hover:underline",
        light:
          "bg-ivory-50 text-ink-900 hover:bg-ivory-100 border border-ink-900/10",
      },
      size: {
        sm: "h-9 px-4 text-xs uppercase tracking-[0.12em]",
        md: "h-11 px-6 text-sm uppercase tracking-[0.12em]",
        lg: "h-13 px-8 text-sm uppercase tracking-[0.14em]",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };