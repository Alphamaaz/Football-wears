import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppDialogProvider } from "@/components/AppDialogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Football Wears — Official Football Kits, Boots & Retro Classics",
    template: "%s · Football Wears",
  },
  description:
    "Official store for authentic club football shirts, national team kits, legendary retro classics, pro boots, and custom player font printing with Cash on Delivery nationwide.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppDialogProvider>{children}</AppDialogProvider>
      </body>
    </html>
  );
}
