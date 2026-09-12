import { notFound } from "next/navigation"

import {
  Grid,
  GridItem,
  type GapScale,
  type GridItemSize,
  type ResponsiveValue,
} from "@/components/ui/grid"

type ItemConfig = {
  size?: ResponsiveValue<GridItemSize>
  offset?: ResponsiveValue<GridItemSize>
  nested?: {
    gap?: ResponsiveValue<GapScale>
    rowGap?: ResponsiveValue<GapScale>
    colGap?: ResponsiveValue<GapScale>
    items: ItemConfig[]
  }
}

type FixtureConfig = {
  containerWidth: number
  gap?: ResponsiveValue<GapScale>
  rowGap?: ResponsiveValue<GapScale>
  colGap?: ResponsiveValue<GapScale>
  items: ItemConfig[]
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cfg?: string }>
}) {
  if (process.env.NODE_ENV === "production") notFound()

  const { cfg } = await searchParams
  if (!cfg) {
    return <div data-testid="missing-cfg">missing cfg</div>
  }

  const config: FixtureConfig = JSON.parse(cfg)
  const { containerWidth, gap, rowGap, colGap, items } = config

  return (
    <div
      data-testid="grid-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: containerWidth,
        background: "white",
        zIndex: 100,
      }}
    >
      <Grid gap={gap} rowGap={rowGap} colGap={colGap} data-testid="grid">
        {items.map((item, i) => (
          <GridItem
            key={i}
            size={item.size}
            offset={item.offset}
            data-testid={`item-${i}`}
            style={item.nested ? undefined : { height: 40, background: "#888" }}
          >
            {item.nested && (
              <Grid
                gap={item.nested.gap}
                rowGap={item.nested.rowGap}
                colGap={item.nested.colGap}
                data-testid={`item-${i}-grid`}
              >
                {item.nested.items.map((inner, j) => (
                  <GridItem
                    key={j}
                    size={inner.size}
                    offset={inner.offset}
                    data-testid={`item-${i}-${j}`}
                    style={{ height: 40, background: "#666" }}
                  />
                ))}
              </Grid>
            )}
          </GridItem>
        ))}
      </Grid>
    </div>
  )
}
