import { fetchAllMatches } from '@/lib/fetchAllMatches';
import { PredictMatchCards } from '../_components/PredictMatchCards';

export const revalidate = 1800;

export default async function PredictPage() {
  const rawMatches = await fetchAllMatches().catch(() => []);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
      <h1 className="font-headline font-extrabold text-primary text-2xl sm:text-3xl">
        Predict and Win Coins
      </h1>
      <p className="font-body-md text-sm text-on-surface-variant mt-1 mb-5">
        Choose the Match
      </p>

      <PredictMatchCards rawMatches={rawMatches} />
    </main>
  );
}