import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-[3px] border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/85",
        secondary: "border-border/80 bg-secondary text-secondary-foreground [a]:hover:bg-secondary/90",
        destructive:
          "border-dispute/25 bg-dispute/15 text-[#fecaca] focus-visible:ring-dispute/30 [a]:hover:bg-dispute/22",
        outline: "border-border/80 text-foreground [a]:hover:bg-muted/60 [a]:hover:text-foreground",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        mint: "border-mint/35 bg-mint/12 text-mint-muted [a]:hover:bg-mint/18",
        amber: "border-amber-warn/40 bg-amber-warn/14 text-amber-warn [a]:hover:bg-amber-warn/20",
        info: "border-info/35 bg-info/12 text-info [a]:hover:bg-info/18",
        dispute: "border-dispute/30 bg-dispute/12 text-[#fecaca] [a]:hover:bg-dispute/18",
        subtle: "border-border/60 bg-muted/50 text-muted-foreground [a]:hover:bg-muted/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
