import { Grid, GridColumn } from "@/components/ui/grid"
import { CodeBlock } from "@/components/site/code-block"
import { CodePreview } from "@/components/site/code-preview"
import { Block } from "@/components/site/block"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/site/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/site/tabs"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Button } from "@/components/site/button"
import Link from "next/link"

const REGISTRY_URL = "https://grid.joohyunpark.com/registry/grid.json"
const INSTALL_COMMANDS = [
  { name: "pnpm", command: `pnpm dlx shadcn@latest add ${REGISTRY_URL}` },
  { name: "npm", command: `npx shadcn@latest add ${REGISTRY_URL}` },
  { name: "yarn", command: `yarn dlx shadcn@latest add ${REGISTRY_URL}` },
  { name: "bun", command: `bunx shadcn@latest add ${REGISTRY_URL}` },
] as const

export default function Page() {
  return (
    <div>
      <Block>
        <h1>Grid</h1>
        <p className="text-muted-foreground">
          An opinionated grid system for React and Tailwind
        </p>

        <div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="https://github.com/jooohyunpark/grid" />}
            nativeButton={false}
          >
            GitHub
          </Button>
        </div>
      </Block>

      <Block>
        <h2>Why Grid</h2>

        <p>
          Responsive layouts and Tailwind are everyday tools for building modern
          websites. Combining them isn’t — two patterns keep getting in the way:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="font-medium text-foreground">
              Layout gets lost in the class string.
            </strong>{" "}
            Spans, gaps, and breakpoints sit alongside every other utility, and
            a grid’s container and its columns are both just a{" "}
            <code>{`<div>`}</code> with classes. You can’t see the layout at a
            glance.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Tailwind’s breakpoints stop at the component boundary.
            </strong>{" "}
            Reach for a library grid like MUI’s and you redeclare breakpoints in
            its theme — two configs to keep in sync, and one more provider
            wrapping your app.
          </li>
        </ul>

        <p>
          Grid brings a 12-column grid system to Tailwind, built on CSS grid:{" "}
          <code>Grid</code> for containers, <code>GridColumn</code> for columns.
          Type-safe responsive props, plain Tailwind under the hood, copy-paste
          install. No runtime, no dependencies, no config.
        </p>
      </Block>

      {/* Installation */}
      <Block>
        <h2>Installation</h2>
        <p>Add Grid to your project via the shadcn CLI.</p>
        <Tabs defaultValue="pnpm">
          <TabsList variant="line">
            {INSTALL_COMMANDS.map(({ name }) => (
              <TabsTrigger key={name} value={name}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          {INSTALL_COMMANDS.map(({ name, command }) => (
            <TabsContent key={name} value={name}>
              <CodeBlock code={command} lang="bash" />
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-muted-foreground">Then import it:</p>
        <CodeBlock
          code={`import { Grid, GridColumn } from "@/components/ui/grid"`}
          lang="tsx"
        />
      </Block>

      <Block>
        <h2>Examples</h2>

        <h3>Responsive span</h3>
        <CodePreview>
          <Grid>
            <GridColumn span={{ base: 12, md: 8 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                base: 12 · md: 8
              </div>
            </GridColumn>
            <GridColumn span={{ base: 12, md: 4 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                base: 12 · md: 4
              </div>
            </GridColumn>
            {(["C", "D"] as const).map((label) => (
              <GridColumn key={label} span={{ base: 12, md: 6 }}>
                <div className="rounded bg-muted p-4 text-center text-sm">
                  base: 12 · md: 6
                </div>
              </GridColumn>
            ))}
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid>
  <GridColumn span={{ base: 12, md: 8 }}>...</GridColumn>
  <GridColumn span={{ base: 12, md: 4 }}>...</GridColumn>
  <GridColumn span={{ base: 12, md: 6 }}>...</GridColumn>
  <GridColumn span={{ base: 12, md: 6 }}>...</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Responsive gap</h3>
        <CodePreview>
          <Grid gap={{ base: 2, sm: 4, md: 8 }}>
            {(["A", "B", "C"] as const).map((label) => (
              <GridColumn key={label} span={4}>
                <div className="rounded bg-muted p-4 text-center text-sm">
                  {label}
                </div>
              </GridColumn>
            ))}
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={{ base: 2, sm: 4, md: 8 }}>
  <GridColumn span={4}>A</GridColumn>
  <GridColumn span={4}>B</GridColumn>
  <GridColumn span={4}>C</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Nested grids</h3>
        <CodePreview>
          <Grid>
            <GridColumn span={{ md: 8 }}>
              <Grid gap={4}>
                <GridColumn span={6}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Top left
                  </div>
                </GridColumn>
                <GridColumn span={6}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Top right
                  </div>
                </GridColumn>
                <GridColumn span={12}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Bottom
                  </div>
                </GridColumn>
              </Grid>
            </GridColumn>
            <GridColumn span={{ md: 4 }}>
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                Sidebar
              </div>
            </GridColumn>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid>
  <GridColumn span={{ md: 8 }}>
    <Grid gap={4}>
      <GridColumn span={6}>Top left</GridColumn>
      <GridColumn span={6}>Top right</GridColumn>
      <GridColumn span={12}>Bottom</GridColumn>
    </Grid>
  </GridColumn>
  <GridColumn span={{ md: 4 }}>Sidebar</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Reordering</h3>
        <p>
          Grid leaves visual order to Tailwind’s <code>order-*</code> utilities.
          Pass them via <code>className</code> — they take the same responsive
          prefixes (<code>sm:</code>, <code>md:</code>, &hellip;) as any other
          Tailwind class.
        </p>
        <CodePreview>
          <Grid gap={4}>
            <GridColumn span={{ base: 12, md: 4 }} className="md:order-3">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                1st in DOM · 3rd on md
              </div>
            </GridColumn>
            <GridColumn span={{ base: 12, md: 4 }} className="md:order-1">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                2nd in DOM · 1st on md
              </div>
            </GridColumn>
            <GridColumn span={{ base: 12, md: 4 }} className="md:order-2">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                3rd in DOM · 2nd on md
              </div>
            </GridColumn>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={4}>
  <GridColumn span={{ base: 12, md: 4 }} className="md:order-3">...</GridColumn>
  <GridColumn span={{ base: 12, md: 4 }} className="md:order-1">...</GridColumn>
  <GridColumn span={{ base: 12, md: 4 }} className="md:order-2">...</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Start</h3>
        <CodePreview>
          <Grid gap={4}>
            <GridColumn span={{ sm: 6 }} start={{ sm: 4 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                sm start: 4
              </div>
            </GridColumn>
            <GridColumn span={{ md: 4 }} start={{ md: 2 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                md start: 2
              </div>
            </GridColumn>
            <GridColumn span={{ lg: 4 }} start={{ lg: 3 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                lg start: 3
              </div>
            </GridColumn>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={4}>
  <GridColumn span={{ sm: 6 }} start={{ sm: 4 }}>...</GridColumn>
  <GridColumn span={{ md: 4 }} start={{ md: 2 }}>...</GridColumn>
  <GridColumn span={{ lg: 4 }} start={{ lg: 3 }}>...</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Row span</h3>
        <p>
          <code>rowSpan</code> lets a column cover several rows, and the columns
          after it fill in beside it. Rows size to their content, so it works
          best when the columns beside it are of similar height.
        </p>
        <CodePreview>
          <Grid gap={4}>
            <GridColumn span={{ base: 12, md: 8 }} rowSpan={{ md: 2 }}>
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                rowSpan: 2 on md
              </div>
            </GridColumn>
            <GridColumn span={{ base: 12, md: 4 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                span: 4 on md
              </div>
            </GridColumn>
            <GridColumn span={{ base: 12, md: 4 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                span: 4 on md
              </div>
            </GridColumn>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={4}>
  <GridColumn span={{ base: 12, md: 8 }} rowSpan={{ md: 2 }}>...</GridColumn>
  <GridColumn span={{ base: 12, md: 4 }}>...</GridColumn>
  <GridColumn span={{ base: 12, md: 4 }}>...</GridColumn>
</Grid>`}
        />
      </Block>

      <Block>
        <h2>API reference</h2>

        <CodeBlock
          lang="ts"
          code={`type Breakpoint         = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>
type GapScale           = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
type GridSpan           = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridStart          = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridRowSpan        = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type GridElement        = "div" | "section"`}
        />

        <p>
          Every prop except <code>as</code> accepts a single value or a
          per-breakpoint object (e.g. <code>{`{ md: 4, lg: 6 }`}</code>).{" "}
          <code>GapScale</code> follows Tailwind’s spacing scale.
        </p>

        <h3>Grid</h3>

        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <code>rowGap</code>
                </TableCell>
                <TableCell>
                  <code>GapScale</code>
                </TableCell>
                <TableCell>
                  <code>12</code>
                </TableCell>
                <TableCell>Vertical gap</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>colGap</code>
                </TableCell>
                <TableCell>
                  <code>GapScale</code>
                </TableCell>
                <TableCell>
                  <code>8</code>
                </TableCell>
                <TableCell>Horizontal gap</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>gap</code>
                </TableCell>
                <TableCell>
                  <code>GapScale</code>
                </TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell>Shorthand for both axes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>as</code>
                </TableCell>
                <TableCell>
                  <code>GridElement</code>
                </TableCell>
                <TableCell>
                  <code>&quot;div&quot;</code>
                </TableCell>
                <TableCell>Element to render</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Block>

      <Block>
        <h3>GridColumn</h3>
        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <code>span</code>
                </TableCell>
                <TableCell>
                  <code>GridSpan</code>
                </TableCell>
                <TableCell>
                  <code>12</code>
                </TableCell>
                <TableCell>
                  Columns to span (1–12). Use <code>0</code> to hide at a
                  breakpoint.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>start</code>
                </TableCell>
                <TableCell>
                  <code>GridStart</code>
                </TableCell>
                <TableCell>
                  <code>auto</code>
                </TableCell>
                <TableCell>
                  Column line the column starts on (1–12). Wraps to the next row
                  if that column is taken; <code>span</code> is capped so it
                  never runs past the last column.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>rowSpan</code>
                </TableCell>
                <TableCell>
                  <code>GridRowSpan</code>
                </TableCell>
                <TableCell>
                  <code>1</code>
                </TableCell>
                <TableCell>Rows to span (1–12)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>as</code>
                </TableCell>
                <TableCell>
                  <code>GridElement</code>
                </TableCell>
                <TableCell>
                  <code>&quot;div&quot;</code>
                </TableCell>
                <TableCell>Element to render</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Block>

      <footer className="mt-24 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span>
          By{" "}
          <Link href="https://joohyunpark.com" className="hover:underline">
            Joohyun Park
          </Link>
        </span>
        <ThemeToggle />
      </footer>
    </div>
  )
}
