import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scrumbles — Playful Pastel Pet Shop",
  description:
    "A whimsical pastel pet shop bringing joy to pets and their humans. Shop toys, treats, beds & more!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fredoka.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
