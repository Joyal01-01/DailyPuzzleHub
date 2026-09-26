import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSenseH5Provider from "@/components/ads/AdSenseH5Provider";
import RewardedAdModal from "@/components/ads/RewardedAdModal";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        <AdSenseH5Provider />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <RewardedAdModal />
      </body>
    </html>
  );
}
