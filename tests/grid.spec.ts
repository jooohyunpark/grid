import { expect, test, type Page } from "@playwright/test"

type ResponsiveNumber = number | Record<string, number>

type ItemConfig = {
  size?: ResponsiveNumber
  offset?: ResponsiveNumber
  nested?: {
    gap?: ResponsiveNumber
    rowGap?: ResponsiveNumber
    colGap?: ResponsiveNumber
    items: ItemConfig[]
  }
}

type FixtureConfig = {
  containerWidth: number
  gap?: ResponsiveNumber
  rowGap?: ResponsiveNumber
  colGap?: ResponsiveNumber
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

const W = (size: number, container: number, colGap: number) =>
  (size / 12) * (container + colGap) - colGap

const OFFSET_PX = (offset: number, container: number, colGap: number) =>
  (offset / 12) * (container + colGap)

test.describe("Grid + GridItem widths", () => {
  test("default size fills the container", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 700,
      items: [{}],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(700, 0)
  })

  test("size=6 produces half-minus-gap width (default colGap=8 → 32px)", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 700,
      items: [{ size: 6 }, { size: 6 }],
    })
    const expected = W(6, 700, 32)
    expect(await widthOf(page, "item-0")).toBeCloseTo(expected, 0)
    expect(await widthOf(page, "item-1")).toBeCloseTo(expected, 0)
  })

  test("three size=4 items fill a single row exactly", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ size: 4 }, { size: 4 }, { size: 4 }],
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
      items: [{ size: 6 }, { size: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 16), 0)
  })

  test("colGap=0 yields exact size/12 widths", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [{ size: 4 }, { size: 4 }, { size: 4 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(200, 0)
    expect(await widthOf(page, "item-1")).toBeCloseTo(200, 0)
    expect(await widthOf(page, "item-2")).toBeCloseTo(200, 0)
  })

  test("rowGap doesn't affect widths", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      rowGap: 12,
      items: [{ size: 6 }, { size: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("items totaling more than 12 wrap to a new row", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ size: 8 }, { size: 8 }],
    })
    const top0 = await topOf(page, "item-0")
    const top1 = await topOf(page, "item-1")
    expect(top1).toBeGreaterThan(top0)
  })

  test("offset=2 shifts the item by 2/12 of (container + colGap)", async ({
    page,
  }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ size: 4, offset: 2 }],
    })
    const containerLeft = await leftOf(page, "grid-container")
    const itemLeft = await leftOf(page, "item-0")
    const expectedShift = OFFSET_PX(2, 600, 32)
    expect(itemLeft - containerLeft).toBeCloseTo(expectedShift, 0)
  })

  test("size=0 hides the item (zero width)", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ size: 0 }, { size: 12 }],
    })
    const hidden = await page.getByTestId("item-0").boundingBox()
    expect(hidden).toBeNull()
    expect(await widthOf(page, "item-1")).toBeCloseTo(600, 0)
  })

  test("responsive size: { base: 12, md: 6 } at viewport < md is full-width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ size: { base: 12, md: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(500, 0)
  })

  test("responsive size: { base: 12, md: 6 } at viewport ≥ md becomes half", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ size: { base: 12, md: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 500, 32), 0)
  })

  test("responsive size: { base: 0, md: 6 } hides at base, shows at md", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await loadFixture(page, {
      containerWidth: 500,
      items: [{ size: { base: 0, md: 6 } }],
    })
    expect(await page.getByTestId("item-0").boundingBox()).toBeNull()

    await page.setViewportSize({ width: 1024, height: 800 })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 500, 32), 0)
  })
})

test.describe("Exhaustive size sweep", () => {
  for (const size of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
    test(`size=${size} at colGap=0 → size/12 of container`, async ({ page }) => {
      await loadFixture(page, {
        containerWidth: 1200,
        colGap: 0,
        items: [{ size }],
      })
      expect(await widthOf(page, "item-0")).toBeCloseTo(size * 100, 0)
    })
  }
})

test.describe("Exhaustive colGap sweep", () => {
  for (const scale of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const) {
    test(`colGap=${scale} (${scale * 4}px) on two size=6 items`, async ({
      page,
    }) => {
      await loadFixture(page, {
        containerWidth: 600,
        colGap: scale,
        items: [{ size: 6 }, { size: 6 }],
      })
      expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, scale * 4), 0)
    })
  }
})

test.describe("Exhaustive offset sweep", () => {
  for (const offset of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const) {
    test(`offset=${offset} at colGap=0 → offset/12 of container`, async ({
      page,
    }) => {
      await loadFixture(page, {
        containerWidth: 1200,
        colGap: 0,
        items: [{ size: 1, offset }],
      })
      const containerLeft = await leftOf(page, "grid-container")
      const itemLeft = await leftOf(page, "item-0")
      expect(itemLeft - containerLeft).toBeCloseTo(offset * 100, 0)
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
        items: [{ size: { base: 12, [bp]: 6 } }],
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
      items: [{ size: 6 }, { size: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })

  test("colGap=0 overrides shorthand gap=8", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      gap: 8,
      colGap: 0,
      items: [{ size: 6 }, { size: 6 }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(300, 0)
  })

  test("shorthand gap applies to both axes (row spacing)", async ({ page }) => {
    await loadFixture(page, {
      containerWidth: 600,
      gap: 4,
      items: [{ size: 12 }, { size: 12 }],
    })
    const top0 = await topOf(page, "item-0")
    const top1 = await topOf(page, "item-1")
    expect(top1 - top0).toBeCloseTo(56, 0)
  })
})

test.describe("Nested grids", () => {
  test("inner default-size item does not inherit outer item's responsive size", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      colGap: 0,
      items: [
        {
          size: { md: 6 },
          nested: { colGap: 0, items: [{}] },
        },
      ],
    })
    // Outer item is 300px at md; the inner item has no size prop, so it must
    // resolve to the default 12 (300px), not the outer item's md size of 6.
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
          size: 6,
          nested: { colGap: 0, items: [{ size: 6 }, { size: 6 }] },
        },
      ],
    })
    // Outer: W(6, 600, 48) = 276. Inner colGap=0 → 138 each; inheriting the
    // outer md colGap (48px) would give W(6, 276, 48) = 114 instead.
    expect(await widthOf(page, "item-0-0")).toBeCloseTo(W(6, 276, 0), 0)
    expect(await widthOf(page, "item-0-1")).toBeCloseTo(W(6, 276, 0), 0)
  })
})

test.describe("Responsive dedup", () => {
  test("re-emits class when responsive value reverts to an earlier one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 })
    await loadFixture(page, {
      containerWidth: 600,
      items: [{ size: { base: 6, md: 4, lg: 6 } }],
    })
    expect(await widthOf(page, "item-0")).toBeCloseTo(W(6, 600, 32), 0)
  })
})
