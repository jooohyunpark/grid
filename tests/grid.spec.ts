import { expect, test, type Page } from "@playwright/test"

type ResponsiveNumber = number | Record<string, number>

type ItemConfig = {
  span?: ResponsiveNumber
  start?: ResponsiveNumber
  rowSpan?: ResponsiveNumber
  rowStart?: ResponsiveNumber
  as?: string
  className?: string
  nested?: {
    gap?: ResponsiveNumber
    rowGap?: ResponsiveNumber
    colGap?: ResponsiveNumber
    items: ItemConfig[]
  }
}

type FixtureConfig = {
  containerWidth: number
  as?: string
  gap?: ResponsiveNumber
  rowGap?: ResponsiveNumber
  colGap?: ResponsiveNumber
  className?: string
  items: ItemConfig[]
}

async function loadFixture(page: Page, config: FixtureConfig) {
  const cfg = encodeURIComponent(JSON.stringify(config))
  await page.goto(`/playwright/grid?cfg=${cfg}`)
  await expect(page.getByTestId("grid")).toBeAttached()
}

async function widthOf(page: Page, testid: string): Promise<number> {
  const box = await page.getByTestId(testid).boundingBox()
  if (!box) throw new Error(`no bounding box for ${testid}`)
  return box.width
}

async function topOf(page: Page, testid: string): Promise<number> {
  const box = await page.getByTestId(testid).boundingBox()
  if (!box) throw new Error(`no bounding box for ${testid}`)
  return box.y
}

async function leftOf(page: Page, testid: string): Promise<number> {
  const box = await page.getByTestId(testid).boundingBox()
  if (!box) throw new Error(`no bounding box for ${testid}`)
  return box.x
}

const W = (span: number, container: number, colGap: number) =>
  (span / 12) * (container + colGap) - colGap

const START_PX = (start: number, container: number, colGap: number) =>
  ((start - 1) / 12) * (container + colGap)

test.describe("Grid + GridColumn widths", () => {
  test("default span fills the container", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 700,
      items: [{}],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(700, 0)
  })

  test("span=6 produces half-minus-gap width (default colGap=8 → 32px)", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 700,
      items: [{ span: 6 }, { span: 6 }],
    })
    const expected = W(6, 700, 32)
    expect(await widthOf(page, "item-0")).toBeCloseTo(expected, 0)
    expect(await widthOf(page, "item-1")).toBeCloseTo(expected, 0)
  })

  test("three span=4 items fill a single row exactly", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 4 }, { span: 4 }, { span: 4 }],
    })
    const expected = W(4, 600, 32)
    for (const id of ["item-0", "item-1", "item-2"]) {
      expect(await widthOf(page, id)).toBeCloseTo(expected, 0)
    }
    const top0 = await topOf(page, "item-0")
    const top2 = await topOf(page, "item-2")
    expect(top2).toBeCloseTo(top0, 0)
  })

  test("colGap=4 (16px) shrinks gaps and widens items", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 4,
      items: [{ span: 6 }, { span: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 16), 0)
  })

  test("colGap=0 yields exact span/12 widths", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [{ span: 4 }, { span: 4 }, { span: 4 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(200, 0)
    expect(await widthOf(page, "item-1")).toBeCloseTo(200, 0)
    expect(await widthOf(page, "item-2")).toBeCloseTo(200, 0)
  })

  test("rowGap doesn't affect widths", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      rowGap: 12,
      items: [{ span: 6 }, { span: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("items totaling more than 12 wrap to a new row", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 8 }, { span: 8 }],
    })
    const top0 = await topOf(page, "item-0")
    const top1 = await topOf(page, "item-1")
    expect(top1).toBeGreaterThan(top0)
  })

  test("start=3 shifts the item by 2/12 of (container + colGap)", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 4, start: 3 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    const itemLeft = await leftOf(page, "item-0")
    const expectedShift = START_PX(3, 600, 32)
    expect(itemLeft - containerLeft).toBeCloseTo(expectedShift, 0)
  })

  test("start is a column line: an occupied column wraps to the next row", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 6 }, { span: 4, start: 3 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    expect(await topOf(page, "item-1")).toBeGreaterThan(
      await topOf(page, "item-0"),
    )
    expect((await leftOf(page, "item-1")) - containerLeft).toBeCloseTo(
      START_PX(3, 600, 32),
      0,
    )
  })

  test("column gap is capped so 12 columns never overflow a narrow container", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 200,
      items: Array.from({ length: 12 }, () => ({ span: 1 })),
    })
    const container = await page.getByTestId("grid-container").boundingBox()
    const last = await page.getByTestId("item-11").boundingBox()
    if (!container || !last) throw new Error("missing bounding box")
    expect(await topOf(page, "item-11")).toBeCloseTo(
      await topOf(page, "item-0"),
      0,
    )
    expect(last.x + last.width).toBeLessThanOrEqual(
      container.x + container.width + 0.5,
    )
  })

  test("span=0 hides the item (zero width)", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 0 }, { span: 12 }],
    })
    const hidden = await page.getByTestId("item-0").boundingBox()
    expect(hidden).toBeNull()
    expect(await widthOf(page, "item-1")).toBeCloseTo(600, 0)
  })

  test("responsive span: { base: 12, md: 6 } at viewport < md is full-width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ span: { base: 12, md: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(500, 0)
  })

  test("responsive span: { base: 12, md: 6 } at viewport ≥ md becomes half", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ span: { base: 12, md: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 500, 32), 0)
  })

  test("responsive span: { base: 0, md: 6 } hides at base, shows at md", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ span: { base: 0, md: 6 } }],
    })
    expect(await page.getByTestId("item-0").boundingBox()).toBeNull()

    await page.setViewportSize({ width: 1024, height: 800 })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 500, 32), 0)
  })
})

test.describe("Row span", () => {
  // Default rowGap=12 → 48px; fixture items are 40px tall.
  const ROW = 40 + 48

  test("rowSpan=2 holds its columns in the next row", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 6, rowSpan: 2 }, { span: 6 }, { span: 6 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    // item-2 can't take columns 1–6 in row 2, so it lands at column 7.
    expect((await leftOf(page, "item-2")) - containerLeft).toBeCloseTo(
      START_PX(7, 600, 32),
      0,
    )
    expect(
      (await topOf(page, "item-2")) - (await topOf(page, "item-1")),
    ).toBeCloseTo(ROW, 0)
  })

  test("responsive rowSpan: { md: 2 } only spans from md up", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 6, rowSpan: { md: 2 } }, { span: 6 }, { span: 6 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    expect((await leftOf(page, "item-2")) - containerLeft).toBeCloseTo(0, 0)

    await page.setViewportSize({ width: 1024, height: 800 })
    expect((await leftOf(page, "item-2")) - containerLeft).toBeCloseTo(
      START_PX(7, 600, 32),
      0,
    )
  })

  test("nested item does not inherit an outer item's rowSpan", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [
        {
          span: 6,
          rowSpan: 2,
          nested: { colGap: 0, items: [{ span: 6 }, { span: 6 }, { span: 6 }] },
        },
      ],
    })
    // Inner items have no rowSpan: the third wraps to column 1, not column 7.
    const innerLeft = await leftOf(page, "item-0-0")
    expect((await leftOf(page, "item-0-2")) - innerLeft).toBeCloseTo(0, 0)
  })
})

test.describe("Regressions", () => {
  test("hiding at one breakpoint keeps the column's own display elsewhere", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: { base: 0, md: 6 }, className: "flex" }],
    })
    const display = await page
      .getByTestId("item-0")
      .evaluate((el) => getComputedStyle(el).display)
    expect(display).toBe("flex")
  })

  test("hiding is scoped to its own breakpoint range", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: { base: 6, md: 0, xl: 6 } }],
    })
    expect(await page.getByTestId("item-0").boundingBox()).toBeNull()

    await page.setViewportSize({ width: 1300, height: 800 })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)

    await page.setViewportSize({ width: 600, height: 800 })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("start + span past line 13 is clamped instead of adding columns", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ start: 4 }, { span: 1 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    // Default span 12 from line 4 is clamped to 9, ending at the grid's edge.
    expect((await leftOf(page, "item-0")) - containerLeft).toBeCloseTo(
      START_PX(4, 600, 32),
      0,
    )
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(9, 600, 32), 0)
    // No implicit tracks: a span=1 column keeps its 1/12 width.
    expect(await widthOf(page, "item-1")).toBeCloseTo(W(1, 600, 32), 0)
  })
})

test.describe("as prop", () => {
  const tagOf = (page: Page, testid: string) =>
    page.getByTestId(testid).evaluate((el) => el.tagName.toLowerCase())

  test("defaults to div", async ({ page }) => {
    await loadFixture(page, { containerWidth: 600, items: [{}] })
    expect(await tagOf(page, "grid")).toBe("div")
    expect(await tagOf(page, "item-0")).toBe("div")
  })

  test("renders section and keeps the layout", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      as: "section",
      items: [
        { span: 6, as: "section" },
        { span: 6, as: "section" },
      ],
    })
    expect(await tagOf(page, "grid")).toBe("section")
    expect(await tagOf(page, "item-0")).toBe("section")
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })
})

test.describe("Exhaustive span sweep", () => {
  for (const span of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
    test(`span=${span} at colGap=0 → span/12 of container`, async ({
      page,
    }) => {
      await loadFixture(page, {
        containerWidth: 1200,
        colGap: 0,
        items: [{ span }],
      })
      expect(await widthOf(page, "item-0")).toBeCloseTo(span * 100, 0)
    })
  }
})

test.describe("Exhaustive colGap sweep", () => {
  for (const scale of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const) {
    test(`colGap=${scale} (${scale * 4}px) on two span=6 items`, async ({
      page,
    }) => {
      await loadFixture(page, {
        containerWidth: 600,
        colGap: scale,
        items: [{ span: 6 }, { span: 6 }],
      })
      expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, scale * 4), 0)
    })
  }
})

test.describe("Exhaustive start sweep", () => {
  for (const start of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
    test(`start=${start} at colGap=0 → (start-1)/12 of container`, async ({
      page,
    }) => {
      await loadFixture(page, {
        containerWidth: 1200,
        colGap: 0,
        items: [{ span: 1, start }],
      })
      const containerLeft = await leftOf(page, "grid-container")
      const itemLeft = await leftOf(page, "item-0")
      expect(itemLeft - containerLeft).toBeCloseTo((start - 1) * 100, 0)
    })
  }
})

test.describe("Breakpoint activation", () => {
  const cases = [
    { bp: "sm", viewport: 700 },
    { bp: "md", viewport: 800 },
    { bp: "lg", viewport: 1100 },
    { bp: "xl", viewport: 1300 },
    { bp: "2xl", viewport: 1600 },
  ] as const

  for (const { bp, viewport } of cases) {
    test(`${bp}: { base: 12, ${bp}: 6 } resolves to half at viewport=${viewport}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport, height: 800 })
      await loadFixture(page, {
        containerWidth: 400,
        items: [{ span: { base: 12, [bp]: 6 } }],
      })
      expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 400, 32), 0)
    })
  }
})

test.describe("Gap shorthand vs axis precedence", () => {
  test("colGap overrides shorthand gap for column axis", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      gap: 4,
      colGap: 8,
      items: [{ span: 6 }, { span: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("colGap=0 overrides shorthand gap=8", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      gap: 8,
      colGap: 0,
      items: [{ span: 6 }, { span: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(300, 0)
  })

  test("shorthand gap applies to both axes (row spacing)", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      gap: 4,
      items: [{ span: 12 }, { span: 12 }],
    })
    const top0 = await topOf(page, "item-0")
    const top1 = await topOf(page, "item-1")
    expect(top1 - top0).toBeCloseTo(56, 0)
  })
})

test.describe("Nested grids", () => {
  test("inner default-span item does not inherit outer item's responsive span", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [
        {
          span: { md: 6 },
          nested: { colGap: 0, items: [{}] },
        },
      ],
    })
    // Outer item is 300px at md; the inner item has no span prop, so it must
    // resolve to the default 12 (300px), not the outer item's md span of 6.
    expect(await widthOf(page, "item-0-0")).toBeCloseTo(300, 0)
  })

  test("inner grid does not inherit outer grid's responsive colGap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      colGap: { md: 12 },
      items: [
        {
          span: 6,
          nested: { colGap: 0, items: [{ span: 6 }, { span: 6 }] },
        },
      ],
    })
    // Outer: W(6, 600, 48) = 276. Inner colGap=0 → 138 each; inheriting the
    // outer md colGap (48px) would give W(6, 276, 48) = 114 instead.
    expect(await widthOf(page, "item-0-0")).toBeCloseTo(W(6, 276, 0), 0)
    expect(await widthOf(page, "item-0-1")).toBeCloseTo(W(6, 276, 0), 0)
  })
})

test.describe("Responsive fallback", () => {
  test("a value that reverts to an earlier one at a later breakpoint applies", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: { base: 6, md: 4, lg: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })
})

test.describe("Props win over className", () => {
  const rowGapPx = async (page: Page) =>
    (await topOf(page, "item-1")) - (await topOf(page, "item-0")) - 40
  const items = [{ span: 12 }, { span: 12 }, { span: 6 }, { span: 6 }]

  test("gap-1 does not override rowGap", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      rowGap: 4,
      className: "gap-1",
      items,
    })
    expect(await rowGapPx(page)).toBeCloseTo(16, 0)
  })

  test("gap-y-1 / gap-x-1 do not override rowGap / colGap", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      rowGap: 4,
      colGap: 4,
      className: "gap-y-1 gap-x-1",
      items,
    })
    expect(await rowGapPx(page)).toBeCloseTo(16, 0)
    expect(await widthOf(page, "item-2")).toBeCloseTo(W(6, 600, 16), 0)
  })

  test("responsive md:gap-1 does not override gap", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      gap: 4,
      className: "md:gap-1",
      items,
    })
    expect(await rowGapPx(page)).toBeCloseTo(16, 0)
    expect(await widthOf(page, "item-2")).toBeCloseTo(W(6, 600, 16), 0)
  })

  test("col-span-4 does not override span", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 6, className: "col-span-4" }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("md:col-span-4 does not override span", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 6, className: "md:col-span-4" }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("col-span-4 and col-start-3 don't apply without props", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ className: "col-span-4" }, { className: "col-start-3" }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    for (const id of ["item-0", "item-1"]) {
      expect((await leftOf(page, id)) - containerLeft).toBeCloseTo(0, 0)
      expect(await widthOf(page, id)).toBeCloseTo(600, 0)
    }
  })

  test("col-start-3 does not override start", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ span: 2, start: 5, className: "col-start-3" }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    expect((await leftOf(page, "item-0")) - containerLeft).toBeCloseTo(
      START_PX(5, 600, 32),
      0,
    )
  })
})

test.describe("Row props win over row-* className", () => {
  const FILLERS = 7
  // Default rowGap=12 → 48px; fixture items are 40px tall.
  const ROW = 40 + 48

  // item-0 is the column under test; the fillers after it are span=6. While
  // item-0 holds columns 1–6, each filler lands at column 7, so the run of
  // fillers at column 7 is the number of rows item-0 actually spans.
  const loadRowFixture = (page: Page, target: ItemConfig) =>
    loadFixture(page, {
      containerWidth: 600,
      items: [
        { span: 6, ...target },
        ...Array.from({ length: FILLERS }, () => ({ span: 6 })),
      ],
    })

  async function rowsSpanned(page: Page): Promise<number> {
    const containerLeft = await leftOf(page, "grid-container")
    const col7 = START_PX(7, 600, 32)
    let rows = 0
    for (let i = 1; i <= FILLERS; i++) {
      const left = (await leftOf(page, `item-${i}`)) - containerLeft
      if (Math.abs(left - col7) > 1) break
      rows++
    }
    return rows
  }

  const rowEdges = (page: Page) =>
    page.getByTestId("item-0").evaluate((el) => {
      const cs = getComputedStyle(el)
      return { start: cs.gridRowStart, end: cs.gridRowEnd }
    })

  // Class names are written out in full so Tailwind generates them.
  const overrides = [
    "row-span-1",
    "row-span-3",
    "row-span-full",
    "row-span-[3]",
    "row-[span_3]",
    "row-[span_3/span_3]",
    "row-start-[span_3]",
    "row-end-5",
    "row-start-3",
    "row-start-3 row-end-5",
    "row-3",
    "row-auto",
    "row-span-3 row-end-5",
    "flex row-span-3 opacity-50",
    "  row-span-3\n\trow-span-4  ",
  ]

  for (const className of overrides) {
    test(`${JSON.stringify(className)} does not override rowSpan=2`, async ({
      page,
    }) => {
      await loadRowFixture(page, { rowSpan: 2, className })
      expect(await rowsSpanned(page)).toBe(2)
      expect(await rowEdges(page)).toEqual({ start: "auto", end: "span 2" })
    })
  }

  const responsiveOverrides = [
    { className: "sm:row-span-3", viewport: 700 },
    { className: "md:row-span-3", viewport: 800 },
    { className: "lg:row-span-3", viewport: 1100 },
    { className: "xl:row-span-3", viewport: 1300 },
    { className: "2xl:row-span-3", viewport: 1600 },
    { className: "max-md:row-span-3", viewport: 600 },
    { className: "md:max-xl:row-span-3", viewport: 1100 },
    { className: "row-span-3 md:row-span-4 xl:row-span-5", viewport: 1300 },
  ]

  for (const { className, viewport } of responsiveOverrides) {
    test(`"${className}" does not override rowSpan=2 at viewport=${viewport}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport, height: 800 })
      await loadRowFixture(page, { rowSpan: 2, className })
      expect(await rowsSpanned(page)).toBe(2)
    })
  }

  test("explicit rowSpan=1 is not overridden by row-span-3", async ({
    page,
  }) => {
    await loadRowFixture(page, { rowSpan: 1, className: "row-span-3" })
    expect(await rowsSpanned(page)).toBe(1)
  })

  for (const rowSpan of [1, 2, 3, 4, 5, 6] as const) {
    test(`rowSpan=${rowSpan} holds against row-span-7`, async ({ page }) => {
      await loadRowFixture(page, { rowSpan, className: "row-span-7" })
      expect(await rowsSpanned(page)).toBe(rowSpan)
    })
  }

  test("responsive rowSpan holds against row-span-* at every breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadRowFixture(page, {
      rowSpan: { base: 1, md: 3, xl: 2 },
      className: "row-span-4 md:row-span-5 lg:row-span-4 xl:row-span-5",
    })
    expect(await rowsSpanned(page)).toBe(1)
    await page.setViewportSize({ width: 800, height: 800 })
    expect(await rowsSpanned(page)).toBe(3)
    await page.setViewportSize({ width: 1100, height: 800 })
    expect(await rowsSpanned(page)).toBe(3)
    await page.setViewportSize({ width: 1300, height: 800 })
    expect(await rowsSpanned(page)).toBe(2)
  })

  test("rowSpan set only from md still beats row-span-3 below md", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadRowFixture(page, { rowSpan: { md: 2 }, className: "row-span-3" })
    expect(await rowsSpanned(page)).toBe(1)
    await page.setViewportSize({ width: 1024, height: 800 })
    expect(await rowsSpanned(page)).toBe(2)
  })

  test("rowStart places the row and rowSpan spans from it", async ({
    page,
  }) => {
    await loadRowFixture(page, { rowSpan: 2, rowStart: 2 })
    expect(
      (await topOf(page, "item-0")) - (await topOf(page, "grid-container")),
    ).toBeCloseTo(ROW, 0)
    expect(await rowEdges(page)).toEqual({ start: "2", end: "span 2" })
  })

  test("rowStart alone spans one row from its line", async ({ page }) => {
    await loadRowFixture(page, { rowStart: 3 })
    expect(
      (await topOf(page, "item-0")) - (await topOf(page, "grid-container")),
    ).toBeCloseTo(2 * ROW, 0)
    expect(await rowEdges(page)).toEqual({ start: "3", end: "span 1" })
  })

  for (const className of [
    "row-start-4",
    "md:row-start-4",
    "row-span-3",
    "row-end-5",
    "row-4",
    "row-start-[span_3]",
  ]) {
    test(`"${className}" does not override rowStart=2`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 })
      await loadRowFixture(page, { rowStart: 2, className })
      expect(await rowEdges(page)).toEqual({ start: "2", end: "span 1" })
    })
  }

  for (const rowStart of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
    test(`rowStart=${rowStart} lands on row line ${rowStart}`, async ({
      page,
    }) => {
      await loadRowFixture(page, { rowStart, className: "row-start-1" })
      expect(await rowEdges(page)).toEqual({
        start: String(rowStart),
        end: "span 1",
      })
    })
  }

  test("responsive rowStart: { md: 2 } is auto below md", async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadRowFixture(page, {
      rowStart: { md: 2 },
      className: "row-start-4",
    })
    expect(await rowEdges(page)).toEqual({ start: "auto", end: "span 1" })
    await page.setViewportSize({ width: 1024, height: 800 })
    expect(await rowEdges(page)).toEqual({ start: "2", end: "span 1" })
  })

  test("without row props, row-start-2 in className still applies", async ({
    page,
  }) => {
    await loadRowFixture(page, { className: "row-start-2" })
    expect(await rowEdges(page)).toMatchObject({ start: "2" })
  })

  test("nested column does not inherit an outer column's rowStart", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ rowStart: 3, nested: { items: [{ span: 6, rowSpan: 1 }] } }],
    })
    expect(
      await page
        .getByTestId("item-0-0")
        .evaluate((el) => getComputedStyle(el).gridRowStart),
    ).toBe("auto")
  })

  test("other classes next to row-span-3 are kept", async ({ page }) => {
    await loadRowFixture(page, {
      rowSpan: 2,
      className: "flex row-span-3 order-1",
    })
    const style = await page.getByTestId("item-0").evaluate((el) => {
      const cs = getComputedStyle(el)
      return { display: cs.display, order: cs.order }
    })
    expect(style).toEqual({ display: "flex", order: "1" })
  })

  test("without rowSpan, row-span-3 in className still applies", async ({
    page,
  }) => {
    await loadRowFixture(page, { className: "row-span-3" })
    expect(await rowsSpanned(page)).toBe(3)
  })

  test("without rowSpan or className, a column spans one row", async ({
    page,
  }) => {
    await loadRowFixture(page, {})
    expect(await rowsSpanned(page)).toBe(1)
  })

  test("nested column's rowSpan holds against row-span-3 on the outer column", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [
        {
          span: 12,
          rowSpan: 1,
          className: "row-span-3",
          nested: {
            colGap: 0,
            items: [{ span: 6, rowSpan: 2 }, { span: 6 }, { span: 6 }],
          },
        },
      ],
    })
    const innerLeft = await leftOf(page, "item-0-0")
    expect((await leftOf(page, "item-0-2")) - innerLeft).toBeCloseTo(300, 0)
    expect(
      await page
        .getByTestId("item-0")
        .evaluate((el) => getComputedStyle(el).gridRowEnd),
    ).toBe("span 1")
  })
})
