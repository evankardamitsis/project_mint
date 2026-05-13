import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/45 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm [a]:hover:bg-primary/88",
        outline:
          "border-border bg-transparent text-foreground shadow-none hover:border-border hover:bg-muted/50 aria-expanded:bg-muted/50",
        secondary:
          "border-border/80 bg-secondary text-secondary-foreground hover:border-border hover:bg-muted",
        ghost:
          "hover:bg-muted/60 hover:text-foreground aria-expanded:bg-muted/60",
        destructive:
          "border-dispute/25 bg-dispute/15 text-[#fecaca] hover:border-dispute/35 hover:bg-dispute/22 focus-visible:border-dispute/40 focus-visible:ring-dispute/25",
        link: "text-mint-muted underline-offset-4 hover:text-mint hover:underline",
        /** Mint outline — Make offer */
        offer:
          "border-mint/45 bg-mint/8 text-mint-muted hover:border-mint/55 hover:bg-mint/14",
        /** Soft red — dispute actions */
        dispute:
          "border-dispute/30 bg-dispute/12 text-[#fecaca] hover:border-dispute/40 hover:bg-dispute/18",
        /** Mint-tinted trust / Protected delivery */
        trust:
          "border-mint/35 bg-mint/10 text-mint-muted hover:border-mint/45 hover:bg-mint/16",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-lg),14px)] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9 rounded-xl",
        "icon-xs":
          "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-lg),14px)] in-data-[slot=button-group]:rounded-xl",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const resolvedNativeButton = nativeButton ?? render == null;

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={resolvedNativeButton}
      render={render}
      {...props}
    />
  );
}

export { Button, buttonVariants }
