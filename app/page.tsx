import { Grid, GridItem } from "@/components/ui/grid"
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
          websites. Combining them isn’t — a few patterns keep getting in the
          way:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="font-medium text-foreground">
              Layout classes get buried in the utility string.
            </strong>{" "}
            Column widths, gaps, and alignment sit next to every other utility,
            breakpoints multiply them, and offsets feel off-by-one — shifting
            two columns in means writing <code>col-start-3</code>.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Containers and items look identical.
            </strong>{" "}
            A grid has two roles — the container and its items — but in Tailwind
            they’re both just <code>{`<div>`}</code> with a class string.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Tailwind’s breakpoints stop at the component boundary.
            </strong>{" "}
            Pair Tailwind with a responsive component from another library —
            MUI’s <code>Grid</code>, for example — and you’ll redeclare
            breakpoints in its theme. Two configs to keep in sync, plus another
            provider wrapping your app.
          </li>
        </ul>

        <p>
          Grid brings a 12-column grid system to Tailwind, built on flexbox:{" "}
          <code>Grid</code> for containers, <code>GridItem</code> for items.
          Type-safe responsive props, plain Tailwind under the hood, copy-paste
          install. No runtime, no dependencies, no config. (
          <Link
            href="/why-not-css-grid"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Why flexbox and not CSS grid?
          </Link>
          )
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
          code={`import { Grid, GridItem } from "@/components/ui/grid"`}
          lang="tsx"
        />
      </Block>

      <Block>
        <h2>Examples</h2>

        <h3>Responsive size</h3>
        <CodePreview>
          <Grid>
            <GridItem size={{ base: 12, md: 8 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                base: 12 · md: 8
              </div>
            </GridItem>
            <GridItem size={{ base: 12, md: 4 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                base: 12 · md: 4
              </div>
            </GridItem>
            {(["C", "D"] as const).map((label) => (
              <GridItem key={label} size={{ base: 12, md: 6 }}>
                <div className="rounded bg-muted p-4 text-center text-sm">
                  base: 12 · md: 6
                </div>
              </GridItem>
            ))}
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid>
  <GridItem size={{ base: 12, md: 8 }}>...</GridItem>
  <GridItem size={{ base: 12, md: 4 }}>...</GridItem>
  <GridItem size={{ base: 12, md: 6 }}>...</GridItem>
  <GridItem size={{ base: 12, md: 6 }}>...</GridItem>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Responsive gap</h3>
        <CodePreview>
          <Grid gap={{ base: 2, sm: 4, md: 8 }}>
            {(["A", "B", "C"] as const).map((label) => (
              <GridItem key={label} size={4}>
                <div className="rounded bg-muted p-4 text-center text-sm">
                  {label}
                </div>
              </GridItem>
            ))}
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={{ base: 2, sm: 4, md: 8 }}>
  <GridItem size={4}>A</GridItem>
  <GridItem size={4}>B</GridItem>
  <GridItem size={4}>C</GridItem>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Nested grids</h3>
        <CodePreview>
          <Grid>
            <GridItem size={{ md: 8 }}>
              <Grid gap={4}>
                <GridItem size={6}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Top left
                  </div>
                </GridItem>
                <GridItem size={6}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Top right
                  </div>
                </GridItem>
                <GridItem size={12}>
                  <div className="rounded bg-muted p-4 text-center text-sm">
                    Bottom
                  </div>
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem size={{ md: 4 }}>
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                Sidebar
              </div>
            </GridItem>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid>
  <GridItem size={{ md: 8 }}>
    <Grid gap={4}>
      <GridItem size={6}>Top left</GridItem>
      <GridItem size={6}>Top right</GridItem>
      <GridItem size={12}>Bottom</GridItem>
    </Grid>
  </GridItem>
  <GridItem size={{ md: 4 }}>Sidebar</GridItem>
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
            <GridItem size={{ base: 12, md: 4 }} className="md:order-3">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                1st in DOM · 3rd on md
              </div>
            </GridItem>
            <GridItem size={{ base: 12, md: 4 }} className="md:order-1">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                2nd in DOM · 1st on md
              </div>
            </GridItem>
            <GridItem size={{ base: 12, md: 4 }} className="md:order-2">
              <div className="flex h-full items-center justify-center rounded bg-muted p-4 text-center text-sm">
                3rd in DOM · 2nd on md
              </div>
            </GridItem>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={4}>
  <GridItem size={4} className="md:order-3">...</GridItem>
  <GridItem size={4} className="md:order-1">...</GridItem>
  <GridItem size={4} className="md:order-2">...</GridItem>
</Grid>`}
        />
      </Block>

      <Block>
        <h3>Offsets</h3>
        <CodePreview>
          <Grid gap={4}>
            <GridItem size={{ sm: 6 }} offset={{ sm: 3 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                sm offset: 3
              </div>
            </GridItem>
            <GridItem size={{ md: 4 }} offset={{ md: 1 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                md offset: 1
              </div>
            </GridItem>
            <GridItem size={{ lg: 4 }} offset={{ lg: 2 }}>
              <div className="rounded bg-muted p-4 text-center text-sm">
                lg offset: 2
              </div>
            </GridItem>
          </Grid>
        </CodePreview>
        <CodeBlock
          code={`<Grid gap={4}>
  <GridItem size={{ sm: 6 }} offset={{ sm: 3 }}>...</GridItem>
  <GridItem size={{ md: 4 }} offset={{ md: 1 }}>...</GridItem>
  <GridItem size={{ lg: 4 }} offset={{ lg: 2 }}>...</GridItem>
</Grid>`}
        />
      </Block>

      <Block>
        <h2>API reference</h2>

        <CodeBlock
          lang="ts"
          code={`type Breakpoint  = "base" | "sm" | "md" | "lg" | "xl" | "2xl"
type GapScale    = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
type GridItemSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12`}
        />

        <p>
          Every prop accepts a single value or a per-breakpoint object (e.g.{" "}
          <code>{`{ md: 4, lg: 6 }`}</code>). <code>GapScale</code> follows
          Tailwind’s spacing scale.
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
            </TableBody>
          </Table>
        </div>
      </Block>

      <Block>
        <h3>GridItem</h3>
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
                  <code>size</code>
                </TableCell>
                <TableCell>
                  <code>GridItemSize</code>
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
                  <code>offset</code>
                </TableCell>
                <TableCell>
                  <code>GridItemSize</code>
                </TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell>Empty columns before the item</TableCell>
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
