import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { Block } from "@/components/site/block"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { CssGridOverflowDemo } from "@/components/site/css-grid-overflow-demo"

const ARTICLE_DESCRIPTION =
  "Why CSS grid doesn’t work as a 12-column layout system."

export const metadata: Metadata = {
  title: "Why not CSS grid",
  description: ARTICLE_DESCRIPTION,
  openGraph: {
    title: "Why not CSS grid",
    description: ARTICLE_DESCRIPTION,
    type: "article",
  },
}

export default function Page() {
  return (
    <div>
      <Link
        href="/"
        aria-label="Back to home"
        className="inline-flex text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
      </Link>

      <Block>
        <h1>Why CSS grid doesn’t work for a 12-column layout system</h1>
        <p className="text-muted-foreground">
          Gaps are fixed-width, and 11 of them is all it takes to overflow a
          phone.
        </p>
      </Block>

      <Block>
        <p>
          Every design system I’ve built eventually needs a 12-column grid, and
          CSS grid looks made for the job.{" "}
          <code>grid-template-columns: repeat(12, 1fr)</code> spells out the
          shape directly. So that’s where I started.
        </p>

        <figure className="my-4">
          <div className="grid grid-cols-12 gap-8 text-center text-xs font-medium">
            <div className="col-span-12 h-12 rounded bg-muted-foreground/50" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="col-span-6 h-12 rounded bg-muted-foreground/50"
              />
            ))}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="col-span-4 h-12 rounded bg-muted-foreground/50"
              />
            ))}
          </div>
        </figure>
      </Block>

      <Block>
        <h2>Where it breaks</h2>
        <p>
          On most laptop viewports, a 12-column grid looks fine. Pull the slider
          below to shrink the container, and you’ll see items push past the
          right edge around 352px.
        </p>

        <CssGridOverflowDemo className="my-4" />

        <p>
          CSS grid builds a fixed-width scaffold. Gaps are set in concrete —
          they don’t shrink when the container gets smaller, they don’t wrap,
          they don’t collapse. For 12 columns, that’s 11 gaps × 32px (
          <code>gap-8</code>) = 352px of pure gutter. Narrower than that, and
          the grid spills.
        </p>
      </Block>

      <Block>
        <h2>What about container queries?</h2>
        <p>
          The obvious refinement: <code>@container</code> queries that swap the
          column count at smaller widths — 12 &rarr; 4 &rarr; 2. Better than
          viewport media queries, since a grid inside a sidebar shouldn’t care
          about viewport width. But it doesn’t actually solve the problem. The
          layout snaps at thresholds instead of reflowing continuously, and
          spans don’t translate across breakpoints — half on a 12-col grid is{" "}
          <code>col-span-6</code>, on a 4-col grid it’s <code>col-span-2</code>,
          so every item has to restate its span at every breakpoint.
        </p>
        <p>
          There’s also <code>repeat(auto-fit, minmax(MIN, 1fr))</code> — a CSS
          grid pattern that fits as many equal columns as the container allows
          and drops one when it runs out. No breakpoints, no overflow. The
          catch: every column is the same width. You can’t put a one-third card
          next to a two-thirds card in the same row, which is the whole point of
          a 12-column grid.
        </p>
      </Block>

      <Block>
        <h2>Why flex, not CSS grid</h2>
        <p>
          A grid primitive needs three things: continuous reflow as the
          container changes, per-item widths (a third here, a half there), and
          no overflow at any container size.
        </p>
        <p>
          CSS grid gives you per-item widths but fights the other two.{" "}
          <code>auto-fit</code> gives you reflow and safety but locks you into
          uniform columns. Flex-wrap with percentage widths is the only approach
          that delivers all three.
        </p>
        <p>
          Grid builds on <code>flex flex-wrap</code>. Each item declares its own
          percentage width; items that don’t fit wrap to the next row, and the
          gaps wrap with them instead of sitting fixed in the container.
        </p>
        <p>
          The width formula falls out of that:{" "}
          <code>calc(size/12 × (100% + colGap) − colGap)</code>. The{" "}
          <code>+ colGap</code> term reserves a gap-sized chunk for each 1/12
          slot; the <code>− colGap</code> term subtracts the trailing gap that
          the last item in a row doesn’t need. When items wrap, the gaps wrap
          with them, and the formula stays the same.
        </p>

        <CssGridOverflowDemo type="flex" className="my-4" />
      </Block>

      <footer className="mt-24 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span>
          By <Link href="https://joohyunpark.com">Joohyun Park</Link>
        </span>
        <ThemeToggle />
      </footer>
    </div>
  )
}
