import * as React from "react"

import { cn } from "@/lib/utils"

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
export type GapScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
export type GridItemSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface GridProps extends React.ComponentProps<"div"> {
  gap?: ResponsiveValue<GapScale>
  rowGap?: ResponsiveValue<GapScale>
  colGap?: ResponsiveValue<GapScale>
}

export interface GridItemProps extends React.ComponentProps<"div"> {
  size?: ResponsiveValue<GridItemSize>
  offset?: ResponsiveValue<GridItemSize>
}

const BREAKPOINTS = [
  "base",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
] as const satisfies readonly Breakpoint[]
const DEFAULT_SIZE: GridItemSize = 12
const DEFAULT_ROW_GAP: GapScale = 12
const DEFAULT_COL_GAP: GapScale = 8

// Values ride on inline style as per-breakpoint vars (--grid-size-md, …); these
// static classes fold them into the working var (--grid-size) at each
// breakpoint. The working var is class-only — setting it inline would outrank
// the breakpoint variants and freeze the value.
const GRID_CLASS =
  "flex flex-wrap gap-x-(--grid-col-gap) gap-y-(--grid-row-gap) " +
  "[--grid-col-gap:var(--grid-col-gap-base)] sm:[--grid-col-gap:var(--grid-col-gap-sm)] md:[--grid-col-gap:var(--grid-col-gap-md)] lg:[--grid-col-gap:var(--grid-col-gap-lg)] xl:[--grid-col-gap:var(--grid-col-gap-xl)] 2xl:[--grid-col-gap:var(--grid-col-gap-2xl)] " +
  "[--grid-row-gap:var(--grid-row-gap-base)] sm:[--grid-row-gap:var(--grid-row-gap-sm)] md:[--grid-row-gap:var(--grid-row-gap-md)] lg:[--grid-row-gap:var(--grid-row-gap-lg)] xl:[--grid-row-gap:var(--grid-row-gap-xl)] 2xl:[--grid-row-gap:var(--grid-row-gap-2xl)]"

const ITEM_CLASS =
  "min-w-0 " +
  "[--grid-size:var(--grid-size-base)] sm:[--grid-size:var(--grid-size-sm)] md:[--grid-size:var(--grid-size-md)] lg:[--grid-size:var(--grid-size-lg)] xl:[--grid-size:var(--grid-size-xl)] 2xl:[--grid-size:var(--grid-size-2xl)] " +
  "w-[calc(var(--grid-size)/12*(100%+var(--grid-col-gap,0px))-var(--grid-col-gap,0px))]"

const OFFSET_CLASS =
  "[--grid-offset:var(--grid-offset-base)] sm:[--grid-offset:var(--grid-offset-sm)] md:[--grid-offset:var(--grid-offset-md)] lg:[--grid-offset:var(--grid-offset-lg)] xl:[--grid-offset:var(--grid-offset-xl)] 2xl:[--grid-offset:var(--grid-offset-2xl)] " +
  "ml-[calc(var(--grid-offset)/12*(100%+var(--grid-col-gap,0px)))]"

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

function Grid({ gap, rowGap, colGap, className, style, ...props }: GridProps) {
  return (
    <div
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
      {...props}
    />
  )
}

function GridItem({ size, offset, className, style, ...props }: GridItemProps) {
  const hidesAnywhere = Object.values(toRecord(size)).includes(0)
  return (
    <div
      data-slot="grid-item"
      className={cn(
        ITEM_CLASS,
        offset !== undefined && OFFSET_CLASS,
        hidesAnywhere && DISPLAY_CLASS,
        className,
      )}
      style={{
        ...responsiveVars("--grid-size", size, DEFAULT_SIZE, (v) => v),
        ...(offset !== undefined &&
          responsiveVars("--grid-offset", offset, 0, (v) => v)),
        ...(hidesAnywhere &&
          responsiveVars("--grid-display", size, DEFAULT_SIZE, (v) =>
            v === 0 ? "none" : "block",
          )),
        ...style,
      }}
      {...props}
    />
  )
}

export { Grid, GridItem }
