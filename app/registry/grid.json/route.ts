import { readFileSync } from "fs"
import { join } from "path"

export const dynamic = "force-static"

export function GET() {
  const source = readFileSync(
    join(process.cwd(), "components/ui/grid.tsx"),
    "utf-8",
  )

  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "grid",
    type: "registry:ui",
    title: "Grid",
    description: "An opinionated grid system for React and Tailwind.",
    dependencies: ["clsx", "tailwind-merge"],
    registryDependencies: [],
    files: [
      {
        path: "components/ui/grid.tsx",
        content: source,
        type: "registry:ui",
      },
    ],
  })
}
