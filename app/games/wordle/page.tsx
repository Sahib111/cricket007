import type { Metadata } from 'next';
import WordleGame from './_components/WordleGame';

export const metadata: Metadata = {
  title: 'Cricket Wordle – Cricket 007',
  description: 'Guess a 5 letter cricketing term,name,anything.',
};

export default function WordlePage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 flex flex-col items-center">
      <div className="text-center mb-6">
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary">
          Cricket Wordle
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Guess a 5 letter cricketing term,name,anything
        </p>
      </div>

      <WordleGame />
    </main>
  );
}