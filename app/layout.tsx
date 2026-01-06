
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
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sauki Mart",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://saukimart.online",
    siteName: "Sauki Mart",
    title: "SAUKI MART | Instant Data & Devices",
    description: "Secure, Fast, and Reliable Mobile Commerce.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Sauki Mart Logo" }],
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
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
            "image": "https://saukimart.online/logo.png",
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
