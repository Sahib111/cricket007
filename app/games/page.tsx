import type { Metadata } from "next";
import GamesClient from "./_components/GamesClient";

export const metadata: Metadata = {
  title: "Cricket Mini-Games — Wordle, Auction & Trivia",
  description:
    "Play Cricket Wordle, build your dream team in a Mini Auction, guess cricketers from riddles, and suggest new games on Cricket 007.",
  alternates: {
    canonical: "https://cricket007.online/games",
  },
};

export default function GamesPage() {
  return <GamesClient />;
}
