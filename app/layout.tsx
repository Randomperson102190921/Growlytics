import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import ErrorBoundary from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "Growlytics - Plant Care Tracker",
  description: "Keep your plants healthy with smart reminders and tracking. Never forget to water your plants again with automated care schedules and insights.",
  keywords: ["plant care", "gardening", "plant tracker", "watering reminders", "houseplants", "botanical"],
  authors: [{ name: "Growlytics Team" }],
  creator: "Growlytics",
  publisher: "Growlytics",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://growlytics.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Growlytics - Plant Care Tracker",
    description: "Keep your plants healthy with smart reminders and tracking. Never forget to water your plants again!",
    url: "https://growlytics.app",
    siteName: "Growlytics",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "Growlytics - Plant Care Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growlytics - Plant Care Tracker",
    description: "Keep your plants healthy with smart reminders and tracking.",
    images: ["/placeholder-logo.png"],
    creator: "@growlytics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Analytics />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
