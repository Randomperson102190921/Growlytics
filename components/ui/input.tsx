import type * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-input border-2 border-border rounded-md font-medium transition-all duration-200 shadow-[4px_4px_0px_0px_hsl(var(--border))] focus:shadow-[6px_6px_0px_0px_hsl(var(--border))] focus:-translate-x-0.5 focus:-translate-y-0.5 focus:outline-none file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 px-3 py-2 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
