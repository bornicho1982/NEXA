import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import './globals.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NEXA — Destiny 2 Loadout Intelligence",
  description:
    "Manage your Destiny 2 inventory, build optimal loadouts, and get AI-powered recommendations. All in one companion app.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-512.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXA",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ToastProvider } from "@/components/ui/toast";

// ... (other imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased font-sans bg-bg-primary text-text-primary">
        <AuthProvider>
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </AuthProvider>

        {/* PWA Service Worker */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
