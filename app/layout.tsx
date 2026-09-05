import type { Metadata } from "next";
import "./globals.css";
import { HeaderNavbar, Footer, BottomTabBar } from "./_components/Navigation";
import AppShell from "./_components/AppShell";
import PostHogProvider from "./_components/PostHogProvider";
import { ProfileProvider } from "./_components/ProfileProvider";

const PRODUCTION_URL = "https://cricket007.online";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: {
    default: "Cricket 007 — Live Cricket Scores, Predictions & Mini-Games",
    template: "%s | Cricket 007",
  },
  description:
    "Cricket 007 is the ultimate cricket fan platform — live scores, match predictions, Cricket Wordle, mini auctions, player guessing games, and more.",
  openGraph: {
    title: "Cricket 007 — Live Cricket Scores, Predictions & Mini-Games",
    description:
      "Cricket 007 is the ultimate cricket fan platform — live scores, match predictions, Cricket Wordle, mini auctions, player guessing games, and more.",
    url: PRODUCTION_URL,
    siteName: "Cricket 007",
    images: [
      {
        url: `${PRODUCTION_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Cricket 007 — Live Cricket Scores, Predictions & Mini-Games",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cricket 007 — Live Cricket Scores, Predictions & Mini-Games",
    description:
      "Cricket 007 is the ultimate cricket fan platform — live scores, match predictions, Cricket Wordle, mini auctions, player guessing games, and more.",
    images: [`${PRODUCTION_URL}/og-image.jpg`],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
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