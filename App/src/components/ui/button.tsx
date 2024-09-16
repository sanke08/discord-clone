import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex active:scale-95 items-center text-white justify-center bg-primary rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white/10 hover:bg-neutral-400/30 tralsition-all duration-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-sky-700 text-primary-foreground hover:bg-sky-700/90",
        transparent: "bg-transparent text-white hover:bg-white/20",
        gray: "bg-neutral-200 text-secondary-foreground hover:bg-neutral-300",
        none: "bg-transparent text-white hover:bg"

      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        inline: "h-auto px-2 py-1.5 text-sm",
        fit: "h-fit w-fit p-0.5"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean,
  isLoading?: boolean,
  isDisabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isDisabled, isLoading, asChild = false, children, ...props }, ref) => {

    let load = true
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        ></Slot>
      )
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "gap-x-1")}
        ref={ref}
        disabled={isDisabled || isLoading}
        {...props}
      >
        {
          isLoading && <Loader2 className=" animate-spin h-5 w-5" />
        }
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
