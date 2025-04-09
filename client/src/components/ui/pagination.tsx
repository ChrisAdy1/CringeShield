import * as React from "react"
import { cn } from "@/lib/utils"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {}

function Pagination({ className, ...props }: PaginationProps) {
  return (
    <div
      className={cn("flex w-full items-center justify-center gap-2", className)}
      {...props}
    />
  )
}

export { Pagination }