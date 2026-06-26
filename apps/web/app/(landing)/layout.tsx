import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, PT_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./landing-globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _ptMono = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pt-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://pivot-care-ai-web.vercel.app"),
  title: "Pivot Care AI | Automated AI Customer Support Solutions",
  description:
    "Transform your customer support with Pivot Care AI. Deploy advanced, human-like AI agents that resolve tickets, automate workflows, and support customers 24/7.",
  keywords: [
    "AI customer support",
    "customer service automation",
    "AI chatbots for business",
    "automated support tickets",
    "conversational AI agent",
    "24/7 automated support",
    "B2C customer service AI",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pivot-care-ai-web.vercel.app",
    title: "Pivot Care AI | Automated AI Customer Support Solutions",
    description:
      "Transform your customer support with Pivot Care AI. Deploy advanced, human-like AI agents that resolve tickets, automate workflows, and support customers 24/7.",
    siteName: "Pivot Care AI",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Pivot Care AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pivot Care AI | Automated AI Customer Support Solutions",
    description:
      "Transform your customer support with Pivot Care AI. Deploy advanced, human-like AI agents that resolve tickets, automate workflows, and support customers 24/7.",
    images: ["/icon.png"],
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
}

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "dark",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Pivot Care AI",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "description": "Transform your customer support with Pivot Care AI. Deploy advanced, human-like AI agents that resolve tickets, automate workflows, and support customers 24/7.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "author": {
    "@type": "Organization",
    "name": "Pivot Care AI",
    "url": "https://pivot-care-ai-web.vercel.app",
  },
}

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`landing-theme dark min-h-screen font-sans antialiased ${_ptMono.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <Analytics />
    </div>
  )
}