import type { Metadata } from "next";
import "./globals.css";
import { HeaderNavbar, Footer, BottomTabBar } from "./_components/Navigation";
import AppShell from "./_components/AppShell";
import PostHogProvider from "./_components/PostHogProvider";
import { ProfileProvider } from "./_components/ProfileProvider";

export const metadata: Metadata = {
  title: "Cricket 007 – Live Scores, Games & Leaderboard",
  description:
    "Live scores, weekly leaderboard, stats, and cricket games (Cricket Wordle, Mini Auction, Guess the Cricketer) on Cricket 007.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-background font-body-md antialiased">
        <PostHogProvider>
          <ProfileProvider>
            <HeaderNavbar />
            <div className="flex-1 pb-16 md:pb-0">
              <AppShell>{children}</AppShell>
            </div>
            <Footer />
            <BottomTabBar />
          </ProfileProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}