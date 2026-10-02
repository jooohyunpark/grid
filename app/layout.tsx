import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Analytics } from "@vercel/analytics/next"

import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const SITE_DESCRIPTION = "An opinionated grid system for React and Tailwind."

export const metadata: Metadata = {
  metadataBase: new URL("https://grid.joohyunpark.com"),
  title: {
    default: "Grid",
    template: "%s — Grid",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Grid",
    description: SITE_DESCRIPTION,
    url: "https://grid.joohyunpark.com",
    siteName: "Grid",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Grid",
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          storageKey="grid-theme"
          enableSystem
          disableTransitionOnChange
        >
          <main className="mx-auto min-h-svh max-w-prose overflow-x-hidden px-6 py-10">
            {children}
          </main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
