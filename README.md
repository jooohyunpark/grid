# Grid

An opinionated grid system for React and Tailwind.

```bash
pnpm dlx shadcn@latest add https://grid.joohyunpark.com/registry/grid.json
```

## Why Grid

Responsive layouts and Tailwind are everyday tools for building modern websites. Combining them isn't — a few patterns keep getting in the way:

- **Layout classes get buried in the utility string.** Column widths, gaps, and alignment sit next to every other utility, breakpoints multiply them, and offsets feel off-by-one — shifting two columns in means writing `col-start-3`.
- **Containers and items look identical.** A grid has two roles — the container and its items — but in Tailwind they're both just `<div>` with a class string.
- **Tailwind's breakpoints stop at the component boundary.** Pair Tailwind with a responsive component from another library — MUI's `Grid`, for example — and you'll redeclare breakpoints in its theme. Two configs to keep in sync, plus another provider wrapping your app.

Grid brings a 12-column grid system to Tailwind, built on flexbox: `Grid` for containers, `GridItem` for items. Type-safe responsive props, plain Tailwind under the hood, copy-paste install. No runtime, no dependencies, no config. ([Why flexbox and not CSS grid?](https://grid.joohyunpark.com/why-not-css-grid))

## Prerequisites

- React 19+
- Tailwind CSS v4 (uses the `--spacing` theme token)
- The [shadcn CLI](https://ui.shadcn.com/docs/cli)

## Usage

```tsx
import { Grid, GridItem } from "@/components/ui/grid"
```

### Basic

```tsx
<Grid gap={4}>
  <GridItem size={8}>Main</GridItem>
  <GridItem size={4}>Sidebar</GridItem>
</Grid>
```

### Responsive

```tsx
<Grid gap={{ base: 2, md: 6 }}>
  <GridItem size={{ md: 8 }}>Main</GridItem>
  <GridItem size={{ md: 4 }}>Sidebar</GridItem>
</Grid>
```

### Offset

```tsx
<Grid gap={4}>
  <GridItem size={6} offset={3}>Centered</GridItem>
</Grid>
```

## API

### `<Grid>`

| Prop     | Type                        | Default     | Notes                   |
| -------- | --------------------------- | ----------- | ----------------------- |
| `rowGap` | `ResponsiveValue<GapScale>` | `12` (48px) | Vertical gap            |
| `colGap` | `ResponsiveValue<GapScale>` | `8` (32px)  | Horizontal gap          |
| `gap`    | `ResponsiveValue<GapScale>` | —           | Shorthand for both axes |

### `<GridItem>`

| Prop     | Type                            | Default | Notes                                                    |
| -------- | ------------------------------- | ------- | -------------------------------------------------------- |
| `size`   | `ResponsiveValue<GridItemSize>` | `12`    | Columns to span (1–12). Use `0` to hide at a breakpoint. |
| `offset` | `ResponsiveValue<GridItemSize>` | —       | Empty columns before the item                            |

For visual reordering, pass Tailwind's `order-*` utilities via `className` (e.g. `className="md:order-1"`).

Where:

```ts
type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
type GapScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
type GridItemSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
```

`base` is the unprefixed default — values apply until `sm` (640px) takes over. So `size={{ md: 6 }}` is full width on mobile, half from `md` up. When both `gap` and `rowGap`/`colGap` are set at the same breakpoint, the per-axis value wins.

## License

MIT
