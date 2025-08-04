import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-gray-700 placeholder:text-gray-400 selection:bg-blue-600 selection:text-white border-gray-200 flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-blue-400 focus-visible:ring-blue-200 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-200 aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
