import * as React from "react"

import { cn } from "@/lib/utils"

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
export type GapScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
export type GridSpan = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridRowSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type GridElement = "div" | "section"

// Both tags share HTMLElement's props (div only adds the deprecated `align`),
// so one shape covers either tag, including a dynamic `as`. The spread is cast
// to div's props because JSX checks a union tag against each member's ref type.
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
}

const BREAKPOINTS = [
  "base",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const satisfies readonly Breakpoint[]
const DEFAULT_SPAN: GridSpan = 12
const DEFAULT_ROW_GAP: GapScale = 12
const DEFAULT_COL_GAP: GapScale = 8

// Class strings are spelled out in full on purpose: Tailwind only generates
// classes it finds as literal text, so building them in a loop would ship no CSS.
//
// Values ride on inline style as per-breakpoint vars (--grid-span-md, …); these
// static classes fold them into the working var (--grid-span) at each
// breakpoint. The working var is class-only — setting it inline would outrank
// the breakpoint variants and freeze the value.
//
// The column gap is capped at 1/12 of the container: a percentage gap resolves
// against the grid's width, so the 11 gutters can never push it past its edge.
const GRID_CLASS =
  "grid grid-cols-[repeat(12,minmax(0,1fr))] [column-gap:min(var(--grid-col-gap),100%/12)] gap-y-(--grid-row-gap) " +
  "[--grid-col-gap:var(--grid-col-gap-base)] sm:[--grid-col-gap:var(--grid-col-gap-sm)] md:[--grid-col-gap:var(--grid-col-gap-md)] lg:[--grid-col-gap:var(--grid-col-gap-lg)] xl:[--grid-col-gap:var(--grid-col-gap-xl)] 2xl:[--grid-col-gap:var(--grid-col-gap-2xl)] " +
  "[--grid-row-gap:var(--grid-row-gap-base)] sm:[--grid-row-gap:var(--grid-row-gap-sm)] md:[--grid-row-gap:var(--grid-row-gap-md)] lg:[--grid-row-gap:var(--grid-row-gap-lg)] xl:[--grid-row-gap:var(--grid-row-gap-xl)] 2xl:[--grid-row-gap:var(--grid-row-gap-2xl)]"

const COLUMN_CLASS =
  "min-w-0 " +
  "[--grid-span:var(--grid-span-base)] sm:[--grid-span:var(--grid-span-sm)] md:[--grid-span:var(--grid-span-md)] lg:[--grid-span:var(--grid-span-lg)] xl:[--grid-span:var(--grid-span-xl)] 2xl:[--grid-span:var(--grid-span-2xl)] " +
  "[grid-column-end:span_var(--grid-span)]"

// Only applied when start is set, so a nested column never picks up an outer
// column's --grid-start. Longhands on purpose: the grid-column shorthand would
// reset the edge the other class sets.
const START_CLASS =
  "[--grid-start:var(--grid-start-base)] sm:[--grid-start:var(--grid-start-sm)] md:[--grid-start:var(--grid-start-md)] lg:[--grid-start:var(--grid-start-lg)] xl:[--grid-start:var(--grid-start-xl)] 2xl:[--grid-start:var(--grid-start-2xl)] " +
  "[grid-column-start:var(--grid-start)]"

// Same opt-in rule as START_CLASS, for rows.
const ROW_SPAN_CLASS =
  "[--grid-row-span:var(--grid-row-span-base)] sm:[--grid-row-span:var(--grid-row-span-sm)] md:[--grid-row-span:var(--grid-row-span-md)] lg:[--grid-row-span:var(--grid-row-span-lg)] xl:[--grid-row-span:var(--grid-row-span-xl)] 2xl:[--grid-row-span:var(--grid-row-span-2xl)] " +
  "[grid-row-end:span_var(--grid-row-span)]"

// Hides only inside each flagged breakpoint's own range, so outside it the
// column keeps whatever display its className gives it. One attribute per
// breakpoint rather than a token list: Tailwind unquotes attribute values, and
// an unquoted `2xl` is an invalid selector.
const HIDE_CLASS =
  "max-sm:data-hide-base:hidden sm:max-md:data-hide-sm:hidden md:max-lg:data-hide-md:hidden lg:max-xl:data-hide-lg:hidden xl:max-2xl:data-hide-xl:hidden 2xl:data-hide-2xl:hidden"

function toRecord<T>(
  v: ResponsiveValue<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (v == null) return {}
  return typeof v === "object"
    ? (v as Partial<Record<Breakpoint, T>>)
    : { base: v }
}

// Fill in every breakpoint, carrying the last set value forward to mirror
// Tailwind's mobile-first behavior.
function resolve<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: T,
): Record<Breakpoint, T> {
  const r = toRecord(value)
  let current = fallback
  const resolved = {} as Record<Breakpoint, T>
  for (const bp of BREAKPOINTS) resolved[bp] = current = r[bp] ?? current
  return resolved
}

// Emit every breakpoint, not just the ones set: custom properties inherit, so a
// gap in the cascade would leak an ancestor grid's value into a nested one.
function responsiveVars<T>(
  prefix: string,
  resolved: Record<Breakpoint, T>,
  toCss: (v: T) => string | number = (v) => v as string | number,
): React.CSSProperties {
  const vars: Record<string, string | number> = {}
  for (const bp of BREAKPOINTS) vars[`${prefix}-${bp}`] = toCss(resolved[bp])
  return vars as React.CSSProperties
}

const gapValue = (v: GapScale) =>
  v === 0 ? "0px" : `calc(var(--spacing)*${v})`

// Per-axis (colGap/rowGap) overrides the shorthand (gap) at each breakpoint.
const gapVars = (
  shorthand: ResponsiveValue<GapScale> | undefined,
  axis: ResponsiveValue<GapScale> | undefined,
): Partial<Record<Breakpoint, GapScale>> => ({
  ...toRecord(shorthand),
  ...toRecord(axis),
})

function Grid({
  as: Comp = "div",
  gap,
  rowGap,
  colGap,
  className,
  style,
  ...props
}: GridProps) {
  return (
    <Comp
      data-slot="grid"
      className={cn(GRID_CLASS, className)}
      style={{
        ...responsiveVars(
          "--grid-row-gap",
          resolve(gapVars(gap, rowGap), DEFAULT_ROW_GAP),
          gapValue,
        ),
        ...responsiveVars(
          "--grid-col-gap",
          resolve(gapVars(gap, colGap), DEFAULT_COL_GAP),
          gapValue,
        ),
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
  className,
  style,
  ...props
}: GridColumnProps) {
  const spans = resolve(span, DEFAULT_SPAN)
  // Breakpoints before the first set start stay auto-placed.
  const starts = start != null && resolve<GridStart | "auto">(start, "auto")
  // A span running past line 13 would add implicit columns and resize every
  // track, so cap it to the columns left after start.
  const fitted = { ...spans }
  if (starts)
    for (const bp of BREAKPOINTS) {
      const s = starts[bp]
      if (s !== "auto") fitted[bp] = Math.min(spans[bp], 13 - s) as GridSpan
    }
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
        starts && START_CLASS,
        rowSpan != null && ROW_SPAN_CLASS,
        hiddenAt.length > 0 && HIDE_CLASS,
        className,
      )}
      style={{
        ...responsiveVars("--grid-span", fitted),
        ...(starts && responsiveVars("--grid-start", starts)),
        ...(rowSpan != null &&
          responsiveVars("--grid-row-span", resolve(rowSpan, 1))),
        ...style,
      }}
      {...(props as React.ComponentProps<"div">)}
    />
  )
}

export { Grid, GridColumn }
