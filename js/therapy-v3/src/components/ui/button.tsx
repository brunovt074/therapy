import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-[var(--text-on-accent)] hover:bg-[var(--color-primary-hover)]",
        secondary:
          "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
        destructive:
          "text-[var(--text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--bg-tertiary)]",
        link: "text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline-offset-4 hover:underline p-0",
      },
      size: {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-md",
        lg: "px-5 py-2.5 text-base rounded-md",
        icon: "p-1.5 rounded",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
