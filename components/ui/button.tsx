import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex min-h-12 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-transparent bg-clip-padding text-[1.0625rem] font-semibold whitespace-nowrap shadow-ring transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-stashy)] outline-none select-none focus-visible:border-ring focus-visible:shadow-ring-brand active:not-aria-[haspopup]:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-ring-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-ring-brand hover:bg-brand-hover",
        outline:
          "border-brand/25 bg-card text-brand hover:bg-brand-subtle hover:text-brand-hover aria-expanded:bg-brand-subtle aria-expanded:text-brand-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-surface-offset aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "min-h-11 bg-transparent text-brand shadow-none hover:bg-transparent hover:text-brand-hover aria-expanded:bg-transparent aria-expanded:text-brand-hover",
        destructive:
          "bg-destructive text-text-on-brand shadow-none hover:bg-danger-hover focus-visible:border-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[3.25rem] gap-2 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs: "min-h-11 gap-1 px-2.5 text-xs font-medium has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-12 gap-1.5 px-3 text-[0.9375rem] font-medium has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        lg: "h-[3.25rem] gap-2 px-5 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        icon: "size-12",
        "icon-xs": "size-11 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-12",
        "icon-lg": "size-[3.25rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
