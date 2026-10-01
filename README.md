# Grid

An opinionated grid system for React and Tailwind.

```bash
pnpm dlx shadcn@latest add https://grid.joohyunpark.com/registry/grid.json
```

## Why Grid

Responsive layouts and Tailwind are everyday tools for building modern websites. Combining them isn't — two patterns keep getting in the way:

- **Layout gets lost in the class string.** Spans, gaps, and breakpoints sit alongside every other utility, and a grid's container and its columns are both just a `<div>` with classes. You can't see the layout at a glance.
- **Tailwind's breakpoints stop at the component boundary.** Reach for a library grid like MUI's and you redeclare breakpoints in its theme — two configs to keep in sync, and one more provider wrapping your app.

Grid brings a 12-column grid system to Tailwind, built on CSS grid: `Grid` for containers, `GridColumn` for columns. Type-safe responsive props, plain Tailwind under the hood, copy-paste install. No runtime, no dependencies, no config.

## Prerequisites

- React 19+
- Tailwind CSS v4 (uses the `--spacing` theme token)
- A project set up with the [shadcn CLI](https://ui.shadcn.com/docs/cli) (`shadcn init` provides `cn` in `@/lib/utils`)

## Usage

```tsx
import { Grid, GridColumn } from "@/components/ui/grid"
```

### Basic

```tsx
<Grid gap={4}>
  <GridColumn span={8}>Main</GridColumn>
  <GridColumn span={4}>Sidebar</GridColumn>
</Grid>
```

### Responsive

```tsx
<Grid gap={{ base: 2, md: 6 }}>
  <GridColumn span={{ md: 8 }}>Main</GridColumn>
  <GridColumn span={{ md: 4 }}>Sidebar</GridColumn>
</Grid>
```

### Start

```tsx
<Grid gap={4}>
  <GridColumn span={6} start={4}>
    Centered
  </GridColumn>
</Grid>
```

## API

### `<Grid>`

| Prop     | Type                        | Default     | Notes                   |
| -------- | --------------------------- | ----------- | ----------------------- |
| `rowGap` | `ResponsiveValue<GapScale>` | `12` (48px) | Vertical gap            |
| `colGap` | `ResponsiveValue<GapScale>` | `8` (32px)  | Horizontal gap          |
| `gap`    | `ResponsiveValue<GapScale>` | —           | Shorthand for both axes |
| `as`     | `GridElement`               | `"div"`     | Element to render       |

### `<GridColumn>`

| Prop      | Type                           | Default | Notes                                                                                                                                 |
| --------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `span`    | `ResponsiveValue<GridSpan>`    | `12`    | Columns to span (1–12). Use `0` to hide at a breakpoint.                                                                              |
| `start`   | `ResponsiveValue<GridStart>`   | `auto`  | Column line the column starts on (1–12). Wraps to the next row if it's taken; `span` is capped so it never runs past the last column. |
| `rowSpan` | `ResponsiveValue<GridRowSpan>` | `1`     | Rows to span (1–12)                                                                                                                   |
| `as`      | `GridElement`                  | `"div"` | Element to render                                                                                                                     |

For visual reordering, pass Tailwind's `order-*` utilities via `className` (e.g. `className="md:order-1"`).

Where:

```ts
type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
type GapScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
type GridSpan = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridRowSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridElement = "div" | "section"
```

`base` is the unprefixed default — values apply until `sm` (640px) takes over. So `span={{ md: 6 }}` is full width on mobile, half from `md` up. When both `gap` and `rowGap`/`colGap` are set at the same breakpoint, the per-axis value wins.

### Props vs `className`

Gaps and column placement come from props only: `gap-*` and `col-*` classes in `className` don't apply, even when the prop is left at its default (`<Grid rowGap={4} className="gap-1">` keeps a 16px row gap). Use inline `style` if you need an escape hatch. The one exception is `row-span-*`, which overrides `rowSpan`: there's no `rowStart` prop, so the row's start edge is left to `className`.

## License

MIT
