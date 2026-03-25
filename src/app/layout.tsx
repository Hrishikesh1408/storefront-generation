import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleProvider from "../components/providers/GoogleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Page",
  description: "Home page of storefront generation",
};

/**
 * The root layout component wraps all pages in the application.
 * It applies global fonts, CSS, and authentication providers (e.g. GoogleProvider).
 *
 * @param {Object} props - Layout properties.
 * @param {React.ReactNode} props.children - The page components to be rendered inside the layout.
 * @returns {JSX.Element} The root HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
