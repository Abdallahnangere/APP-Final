
import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAUKI MART | Premium Data & Gadgets",
  description: "Nigeria's #1 App for Instant Data (MTN, Airtel, Glo), Airtime, and Premium Phones. SMEDAN Certified SME.",
  keywords: "sauki mart, buy data, mtn data, airtel data, glo data, cheap data, iphone nigeria, samsung nigeria, data reseller, vtu app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
    other: [
      { rel: "icon", sizes: "any", url: "/icons/icon-192x192.png" },
      { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
      { rel: "mask-icon", url: "/icons/icon-maskable-192x192.png", color: "#1e293b" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SAUKI MART",
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
  metadataBase: new URL("https://www.saukimart.online"),
  alternates: {
    canonical: "https://www.saukimart.online",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://www.saukimart.online",
    siteName: "Sauki Mart",
    title: "SAUKI MART | Instant Data & Devices",
    description: "Secure, Fast, and Reliable Mobile Commerce.",
    images: [{ url: "https://www.saukimart.online/icons/icon-512x512.png", width: 512, height: 512, alt: "Sauki Mart Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@saukimart",
    creator: "@saukimart",
    title: "SAUKI MART | Premium Data & Gadgets",
    description: "Nigeria's #1 App for Instant Data, Airtime & Premium Phones",
    images: ["https://www.saukimart.online/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  category: "Business",
  applicationName: "SAUKI MART",
  creator: "Sauki Data Links",
  publisher: "Sauki Data Links",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e293b" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" }
  ],
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // Gold Standard SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "SoftwareApplication",
            "name": "Sauki Mart",
            "operatingSystem": "ANDROID, IOS, WEB",
            "applicationCategory": "ShoppingApplication",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "NGN"
            }
        },
        {
            "@type": "LocalBusiness",
            "name": "Sauki Data Links",
            "image": "https://www.saukimart.online/logo.png",
            "telephone": "+2348061934056",
            "email": "saukidatalinks@gmail.com",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "NG"
            },
            "priceRange": "₦"
        }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <div id="root">
            {children}
            <ServiceWorkerRegister />
        </div>
      </body>
    </html>
  );
}
