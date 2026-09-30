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

// Only applied when start is set, so a nested item never picks up an outer
// item's --grid-start. Longhands on purpose: the grid-column shorthand would
// reset the edge the other class sets.
const START_CLASS =
  "[--grid-start:var(--grid-start-base)] sm:[--grid-start:var(--grid-start-sm)] md:[--grid-start:var(--grid-start-md)] lg:[--grid-start:var(--grid-start-lg)] xl:[--grid-start:var(--grid-start-xl)] 2xl:[--grid-start:var(--grid-start-2xl)] " +
  "[grid-column-start:var(--grid-start)]"

// Same opt-in rule as START_CLASS, for rows.
const ROW_SPAN_CLASS =
  "[--grid-row-span:var(--grid-row-span-base)] sm:[--grid-row-span:var(--grid-row-span-sm)] md:[--grid-row-span:var(--grid-row-span-md)] lg:[--grid-row-span:var(--grid-row-span-lg)] xl:[--grid-row-span:var(--grid-row-span-xl)] 2xl:[--grid-row-span:var(--grid-row-span-2xl)] " +
  "[grid-row-end:span_var(--grid-row-span)]"

const DISPLAY_CLASS =
  "[display:var(--grid-display-base)] sm:[display:var(--grid-display-sm)] md:[display:var(--grid-display-md)] lg:[display:var(--grid-display-lg)] xl:[display:var(--grid-display-xl)] 2xl:[display:var(--grid-display-2xl)]"

function toRecord<T>(
  v: ResponsiveValue<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (v === undefined) return {}
  if (typeof v === "object" && v !== null)
    return v as Partial<Record<Breakpoint, T>>
  return { base: v as T }
}

// Emit every breakpoint, not just the ones set: custom properties inherit, so a
// gap in the cascade would leak an ancestor grid's value into a nested one. The
// last set value carries forward, mirroring Tailwind's mobile-first behavior.
function responsiveVars<T>(
  prefix: string,
  value: ResponsiveValue<T> | undefined,
  fallback: T,
  toCss: (v: T) => string | number,
): React.CSSProperties {
  const r = toRecord(value)
  const vars: Record<string, string | number> = {}
  let current = fallback
  for (const bp of BREAKPOINTS) {
    current = r[bp] ?? current
    vars[`${prefix}-${bp}`] = toCss(current)
  }
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
          gapVars(gap, rowGap),
          DEFAULT_ROW_GAP,
          gapValue,
        ),
        ...responsiveVars(
          "--grid-col-gap",
          gapVars(gap, colGap),
          DEFAULT_COL_GAP,
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
  const hidesAnywhere = Object.values(toRecord(span)).includes(0)
  return (
    <Comp
      data-slot="grid-column"
      className={cn(
        COLUMN_CLASS,
        start !== undefined && START_CLASS,
        rowSpan !== undefined && ROW_SPAN_CLASS,
        hidesAnywhere && DISPLAY_CLASS,
        className,
      )}
      style={{
        ...responsiveVars("--grid-span", span, DEFAULT_SPAN, (v) => v),
        // Breakpoints before the first set start stay auto-placed.
        ...(start !== undefined &&
          responsiveVars<GridStart | "auto">(
            "--grid-start",
            start,
            "auto",
            (v) => v,
          )),
        ...(rowSpan !== undefined &&
          responsiveVars("--grid-row-span", rowSpan, 1, (v) => v)),
        ...(hidesAnywhere &&
          responsiveVars("--grid-display", span, DEFAULT_SPAN, (v) =>
            v === 0 ? "none" : "block",
          )),
        ...style,
      }}
      {...(props as React.ComponentProps<"div">)}
    />
  )
}

export { Grid, GridColumn }
