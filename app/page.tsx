import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";

export const metadata: Metadata = {
  title: "Cricket 007 — Live Cricket Scores, Predictions & Mini-Games",
  description:
    "Play Cricket Wordle, build your dream team in Mini Auction, guess cricketers from hints, predict match winners, and earn coins on Cricket 007.",
  alternates: {
    canonical: "https://cricket007.online",
  },
};

export default function HomePage() {
  return <HomeClient />;
}