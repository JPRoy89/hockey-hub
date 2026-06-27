import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { QueryProvider } from "@/components/ui/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HockeyHub — Stats, Contrats & Mock Trades",
  description:
    "Base de données complète des joueurs NHL, contrats, masse salariale, line builder et mock trades.",
  keywords: ["hockey", "NHL", "stats", "contrats", "mock trade", "cap space", "salary cap"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen ice-bg`}
      >
        <QueryProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-[1400px]">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
