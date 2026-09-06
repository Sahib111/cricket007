import type { Metadata } from 'next';
import AuctionClient from './_components/AuctionClient';

export const metadata: Metadata = {
  title: 'Build Your Team — Mini Auction Game',
  description:
    'Compete in a mini cricket auction! Bid on star players, manage your purse, and build the ultimate dream team on Cricket 007.',
  alternates: {
    canonical: 'https://cricket007.online/games/auction',
  },
};

export default function AuctionPage() {
  return <AuctionClient />;
}
