import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNavbar } from "@/components/main-navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedPrompt+ | AI Health Assistant",
  description:
    "Your AI-powered health assistant for risk assessment, medical insights, and personalized health recommendations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MainNavbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
