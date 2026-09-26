import type { Metadata } from "next";
import { Inter, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSenseH5Provider from "@/components/ads/AdSenseH5Provider";
import RewardedAdModal from "@/components/ads/RewardedAdModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailyPuzzleHub – 20 Free Daily Word, Logic & Memory Games",
  description:
    "Play 20 free daily micro-games seeded deterministically by UTC date. Wordle, Sudoku, Minesweeper, Connections, 2048, Nonogram, Live 1v1 Duels & more.",
  keywords:
    "daily puzzle games, daily wordle, daily sudoku, 1v1 puzzle duels, online mini games, adsense h5 games",
  authors: [{ name: "DailyPuzzleHub Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} ${cinzel.variable} font-sans min-h-screen flex flex-col bg-obsidian-950 text-slate-100 antialiased selection:bg-gold-500/30 selection:text-gold-200`}
      >
        <AdSenseH5Provider />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <RewardedAdModal />
      </body>
    </html>
  );
}
