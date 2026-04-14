import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleProvider from "../components/providers/GoogleProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextStore — AI-Powered Storefront Generation",
  description:
    "Create and manage your AI-powered storefront with NextStore. Generate products, customize your store, and go live in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
