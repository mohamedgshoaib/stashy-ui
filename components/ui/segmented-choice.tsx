"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SegmentedChoiceOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

type SegmentedChoiceProps<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: readonly SegmentedChoiceOption<T>[]
  className?: string
  optionClassName?: string
}

export function SegmentedChoice<T extends string>({
  value,
  onValueChange,
  options,
  className,
  optionClassName,
}: SegmentedChoiceProps<T>) {
  return (
    <div role="radiogroup" className={cn("grid gap-2", className)}>
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface-offset px-3 text-sm font-medium text-text-secondary shadow-ring transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96]",
              selected && "border-brand/25 bg-card text-foreground shadow-ring-brand",
              optionClassName,
            )}
            onClick={() => onValueChange(option.value)}
          >
            {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
