import { notFound } from "next/navigation"

import {
  Grid,
  GridColumn,
  type GapScale,
  type GridSpan,
  type GridStart,
  type GridRowSpan,
  type GridElement,
  type ResponsiveValue,
} from "@/components/ui/grid"

type ItemConfig = {
  span?: ResponsiveValue<GridSpan>
  start?: ResponsiveValue<GridStart>
  rowSpan?: ResponsiveValue<GridRowSpan>
  as?: GridElement
  className?: string
  nested?: {
    gap?: ResponsiveValue<GapScale>
    rowGap?: ResponsiveValue<GapScale>
    colGap?: ResponsiveValue<GapScale>
    items: ItemConfig[]
  }
}

type FixtureConfig = {
  containerWidth: number
  as?: GridElement
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
  const { containerWidth, as, gap, rowGap, colGap, items } = config

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
      <Grid
        as={as}
        gap={gap}
        rowGap={rowGap}
        colGap={colGap}
        data-testid="grid"
      >
        {items.map((item, i) => (
          <GridColumn
            key={i}
            span={item.span}
            start={item.start}
            rowSpan={item.rowSpan}
            as={item.as}
            className={item.className}
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
                  <GridColumn
                    key={j}
                    span={inner.span}
                    start={inner.start}
                    rowSpan={inner.rowSpan}
                    data-testid={`item-${i}-${j}`}
                    style={{ height: 40, background: "#666" }}
                  />
                ))}
              </Grid>
            )}
          </GridColumn>
        ))}
      </Grid>
    </div>
  )
}
