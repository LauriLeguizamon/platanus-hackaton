"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ConfigSectionProps {
  title: string
  configured?: boolean
  configuredLabel?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function ConfigSection({
  title,
  configured = false,
  configuredLabel,
  defaultOpen = false,
  children,
}: ConfigSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {title}
            {!open && configured && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 max-w-[180px] truncate">
                {configuredLabel || "Configured"}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 pb-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
