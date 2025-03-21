import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "./lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-secondary/30 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-destructive/30 bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "border-primary/30 text-foreground",
                success:
                    "border-green-300 bg-green-100 text-green-800 hover:bg-green-200/80",
                warning:
                    "border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200/80",
                error:
                    "border-red-300 bg-red-100 text-red-800 hover:bg-red-200/80",
                info:
                    "border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

