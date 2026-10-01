import * as React from "react"

import { cn } from "@/lib/utils"

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
export type GapScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
export type GridSpan = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridRowSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridRowStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridElement = "div" | "section"

type ElementProps = { as?: GridElement } & React.ComponentProps<"section">

export interface GridProps extends ElementProps {
  gap?: ResponsiveValue<GapScale>
  rowGap?: ResponsiveValue<GapScale>
  colGap?: ResponsiveValue<GapScale>
}

export interface GridColumnProps extends ElementProps {
  span?: ResponsiveValue<GridSpan>
  start?: ResponsiveValue<GridStart>
  rowSpan?: ResponsiveValue<GridRowSpan>
  rowStart?: ResponsiveValue<GridRowStart>
}

type Resolved<T> = Record<Breakpoint, T>

const BREAKPOINTS = [
  "base",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const satisfies readonly Breakpoint[]

const COLUMNS = 12
const DEFAULT_ROW_GAP: GapScale = 12
const DEFAULT_COL_GAP: GapScale = 8

const GRID_CLASS = [
  "grid grid-cols-[repeat(12,minmax(0,1fr))]",
  "[&&]:[column-gap:min(calc(var(--spacing)*var(--grid-col-gap)),100%/12)]",
  "[&&]:[row-gap:calc(var(--spacing)*var(--grid-row-gap))]",
  "[--grid-col-gap:var(--grid-col-gap-base)] sm:[--grid-col-gap:var(--grid-col-gap-sm)] md:[--grid-col-gap:var(--grid-col-gap-md)] lg:[--grid-col-gap:var(--grid-col-gap-lg)] xl:[--grid-col-gap:var(--grid-col-gap-xl)] 2xl:[--grid-col-gap:var(--grid-col-gap-2xl)]",
  "[--grid-row-gap:var(--grid-row-gap-base)] sm:[--grid-row-gap:var(--grid-row-gap-sm)] md:[--grid-row-gap:var(--grid-row-gap-md)] lg:[--grid-row-gap:var(--grid-row-gap-lg)] xl:[--grid-row-gap:var(--grid-row-gap-xl)] 2xl:[--grid-row-gap:var(--grid-row-gap-2xl)]",
].join(" ")

const COLUMN_CLASS = [
  "min-w-0",
  "[&&]:[grid-column-start:var(--grid-start)] [&&]:[grid-column-end:span_var(--grid-span)]",
  "[--grid-span:var(--grid-span-base)] sm:[--grid-span:var(--grid-span-sm)] md:[--grid-span:var(--grid-span-md)] lg:[--grid-span:var(--grid-span-lg)] xl:[--grid-span:var(--grid-span-xl)] 2xl:[--grid-span:var(--grid-span-2xl)]",
  "[--grid-start:var(--grid-start-base)] sm:[--grid-start:var(--grid-start-sm)] md:[--grid-start:var(--grid-start-md)] lg:[--grid-start:var(--grid-start-lg)] xl:[--grid-start:var(--grid-start-xl)] 2xl:[--grid-start:var(--grid-start-2xl)]",
].join(" ")

const ROW_CLASS = [
  "[&&]:[grid-row-start:var(--grid-row-start)] [&&]:[grid-row-end:span_var(--grid-row-span)]",
  "[--grid-row-span:var(--grid-row-span-base)] sm:[--grid-row-span:var(--grid-row-span-sm)] md:[--grid-row-span:var(--grid-row-span-md)] lg:[--grid-row-span:var(--grid-row-span-lg)] xl:[--grid-row-span:var(--grid-row-span-xl)] 2xl:[--grid-row-span:var(--grid-row-span-2xl)]",
  "[--grid-row-start:var(--grid-row-start-base)] sm:[--grid-row-start:var(--grid-row-start-sm)] md:[--grid-row-start:var(--grid-row-start-md)] lg:[--grid-row-start:var(--grid-row-start-lg)] xl:[--grid-row-start:var(--grid-row-start-xl)] 2xl:[--grid-row-start:var(--grid-row-start-2xl)]",
].join(" ")

const HIDE_CLASS =
  "max-sm:data-hide-base:hidden sm:max-md:data-hide-sm:hidden md:max-lg:data-hide-md:hidden lg:max-xl:data-hide-lg:hidden xl:max-2xl:data-hide-xl:hidden 2xl:data-hide-2xl:hidden"

function toRecord<T>(
  value: ResponsiveValue<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (value == null) return {}
  return typeof value === "object"
    ? (value as Partial<Record<Breakpoint, T>>)
    : { base: value }
}

function resolve<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: T,
): Resolved<T> {
  const set = toRecord(value)
  const resolved = {} as Resolved<T>
  let current = fallback
  for (const bp of BREAKPOINTS) resolved[bp] = current = set[bp] ?? current
  return resolved
}

function cssVars(
  name: string,
  resolved: Resolved<string | number>,
): React.CSSProperties {
  return Object.fromEntries(
    BREAKPOINTS.map((bp) => [`${name}-${bp}`, resolved[bp]]),
  )
}

function fitSpans(
  spans: Resolved<GridSpan>,
  starts: Resolved<GridStart | "auto">,
): Resolved<number> {
  const fitted: Resolved<number> = { ...spans }
  for (const bp of BREAKPOINTS) {
    const start = starts[bp]
    if (start !== "auto") fitted[bp] = Math.min(spans[bp], COLUMNS + 1 - start)
  }
  return fitted
}

function Grid({
  as: Comp = "div",
  gap,
  rowGap,
  colGap,
  className,
  style,
  ...props
}: GridProps) {
  const shorthand = toRecord(gap)
  const rowGaps = resolve(
    { ...shorthand, ...toRecord(rowGap) },
    DEFAULT_ROW_GAP,
  )
  const colGaps = resolve(
    { ...shorthand, ...toRecord(colGap) },
    DEFAULT_COL_GAP,
  )

  return (
    <Comp
      data-slot="grid"
      className={cn(GRID_CLASS, className)}
      style={{
        ...cssVars("--grid-row-gap", rowGaps),
        ...cssVars("--grid-col-gap", colGaps),
        ...style,
      }}
      {...(props as React.ComponentProps<"div">)}
    />
  )
}

function GridColumn({
  as: Comp = "div",
  span,
  start,
  rowSpan,
  rowStart,
  className,
  style,
  ...props
}: GridColumnProps) {
  const spans = resolve<GridSpan>(span, COLUMNS)
  const starts = resolve<GridStart | "auto">(start, "auto")
  const placesRow = rowSpan != null || rowStart != null

  const hiddenAt = BREAKPOINTS.filter((bp) => spans[bp] === 0)
  const hideAttrs = Object.fromEntries(
    hiddenAt.map((bp) => [`data-hide-${bp}`, ""]),
  )

  return (
    <Comp
      data-slot="grid-column"
      {...hideAttrs}
      className={cn(
        COLUMN_CLASS,
        placesRow && ROW_CLASS,
        hiddenAt.length > 0 && HIDE_CLASS,
        className,
      )}
      style={{
        ...cssVars("--grid-span", fitSpans(spans, starts)),
        ...cssVars("--grid-start", starts),
        ...(placesRow && {
          ...cssVars("--grid-row-span", resolve<GridRowSpan>(rowSpan, 1)),
          ...cssVars(
            "--grid-row-start",
            resolve<GridRowStart | "auto">(rowStart, "auto"),
          ),
        }),
        ...style,
      }}
      {...(props as React.ComponentProps<"div">)}
    />
  )
}

export { Grid, GridColumn }
