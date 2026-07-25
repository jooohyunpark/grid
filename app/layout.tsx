import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Analytics } from "@vercel/analytics/next"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_DESCRIPTION = "An opinionated grid system for React and Tailwind."

export const metadata: Metadata = {
  metadataBase: new URL("https://teul.joohyunpark.com"),
  title: {
    default: "Teul",
    template: "%s — Teul",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Teul",
    description: SITE_DESCRIPTION,
    url: "https://teul.joohyunpark.com",
    siteName: "Teul",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Teul",
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          storageKey="teul-theme"
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
