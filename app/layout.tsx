
import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Sauki Mart | Premium Mobile Commerce & Instant Data Delivery Nigeria",
  description: "Nigeria's trusted digital marketplace for instant MTN, Airtel, Glo data bundles, authentic mobile devices, and secure wallet services. SMEDAN-certified commerce platform.",
  keywords: "data plans Nigeria, buy data online, instant airtime, mobile commerce, digital marketplace, secure payment, mobile devices Nigeria, data reseller platform",
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
    title: "Sauki Mart",
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
    title: "Sauki Mart | Premium Mobile Commerce Platform",
    description: "Secure, fast, and reliable digital marketplace for data bundles and mobile devices",
    images: [{ url: "https://www.saukimart.online/icons/icon-512x512.png", width: 512, height: 512, alt: "Sauki Mart - Premium Digital Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sauki Mart | Instant Data & Devices",
    description: "Nigeria's trusted platform for data bundles, airtime, and mobile devices",
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
  applicationName: "Sauki Mart",
  creator: "Sauki Data Links",
  publisher: "Sauki Data Links",
  verification: {
    google: "site-verification-code",
  },
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
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/render.png" as="image" />
      </head>
      <body className={`${inter.className} ${playfair.variable} ${dmSans.variable}`}>
        <div id="root">
            {children}
            <ServiceWorkerRegister />
        </div>
      </body>
    </html>
  );
}
