import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Create a ticket | RMM Service Desk",
  description: "Submit a support request to the RMM service desk.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geistSans.variable}>{children}</body></html>;
}
