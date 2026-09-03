'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';
import SuggestGameModal from '@/app/_components/SuggestGameModal';
import DailyTriviaBar from '@/app/_components/DailyTriviaBar';

export default function HomePage() {
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  /* Temporarily disabled live match fetching
  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => setMatches(data.matches ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  const genderMatches = matches.filter((m) => (activeGender === 'womens' ? isWomensMatch(m) : !isWomensMatch(m)));
  const relevantOnly = genderMatches.filter(isRelevantMatch).filter(isWithinNextWeek);
  const finalMatches = relevantOnly.length >= 3 ? relevantOnly : (genderMatches.length > 0 ? genderMatches : relevantOnly);

  const filteredMatches = finalMatches.sort((a, b) => {
    const order = { live: 0, upcoming: 1, result: 2 };
    return order[getMatchStatusLabel(a)] - order[getMatchStatusLabel(b)];
  });
  */

  return (
    <main className="flex-grow flex flex-col w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-4 sm:pt-6 pb-12 gap-5 sm:gap-6">
      {/* Today's Trivia — replaces the gender toggle and live scores placeholder */}
      <DailyTriviaBar />

      {/* Predict & Win Banner */}
      <Link
        href="/predict"
        onClick={() => track(ANALYTICS_EVENTS.PREDICT_BANNER_CLICKED, { source: 'home' })}
        className="w-full bg-gradient-to-br from-secondary to-secondary-container text-on-primary rounded-xl p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-all shadow-md mt-2"
      >
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">
            online_prediction
          </span>
          <h3 className="font-headline m-0 text-xl sm:text-2xl font-bold tracking-tight text-white">
            Predict and win coins
          </h3>
        </div>
        <span className="material-symbols-outlined text-2xl text-white group-hover:translate-x-1 transition-transform" aria-hidden="true">
          arrow_forward
        </span>
      </Link>

      {/* Test Your Knowledge */}
      <section aria-labelledby="games-heading" className="flex flex-col gap-6 w-full mt-4">
        <h2
          id="games-heading"
          className="font-headline font-extrabold text-primary border-b-2 border-secondary pb-4 text-3xl sm:text-4xl tracking-tight"
        >
          Test Your Knowledge
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <Link
            id="card-wordle"
            href="/games/wordle"
            onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'wordle', source: 'home' })}
            className="group bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-6 sm:p-8 flex items-center justify-between hover:shadow-md hover:border-secondary hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">grid_on</span>
              </div>
              <div>
                <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface group-hover:text-secondary transition-colors">
                  Cricket Wordle
                </div>
                <div className="font-body-md text-base sm:text-xl text-on-surface-variant mt-1">
                  Daily Word Guess
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-3xl sm:text-4xl">
              chevron_right
            </span>
          </Link>

          <Link
            id="card-auction"
            href="/games/auction"
            onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'auction', source: 'home' })}
            className="group bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-6 sm:p-8 flex items-center justify-between hover:shadow-md hover:border-secondary hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-secondary to-secondary-container text-on-secondary flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">strategy</span>
              </div>
              <div>
                <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface group-hover:text-secondary transition-colors">
                  Build Your Team
                </div>
                <div className="font-body-md text-base sm:text-xl text-on-surface-variant mt-1">
                  Mini Auction is Live!
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-3xl sm:text-4xl">
              chevron_right
            </span>
          </Link>

          <Link
            id="card-guess-cricketer"
            href="/games/guess-cricketer"
            onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'guess-cricketer', source: 'home' })}
            className="group bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-6 sm:p-8 flex items-center justify-between hover:shadow-md hover:border-secondary hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">person_search</span>
              </div>
              <div>
                <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface group-hover:text-secondary transition-colors">
                  Guess the Cricketer
                </div>
                <div className="font-body-md text-base sm:text-xl text-on-surface-variant mt-1">
                  Use 5 hints
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-3xl sm:text-4xl">
              chevron_right
            </span>
          </Link>

          <button
            id="card-suggest-game"
            onClick={() => setShowSuggestModal(true)}
            className="group bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-6 sm:p-8 flex items-center justify-between hover:shadow-md hover:border-secondary hover:scale-[1.01] hover:bg-surface-container transition-all text-left w-full cursor-pointer"
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-container-highest flex items-center justify-center text-3xl sm:text-4xl text-outline shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">add_circle</span>
              </div>
              <div>
                <div className="font-headline font-bold text-2xl sm:text-3xl text-primary group-hover:text-secondary transition-colors">
                  Suggest a Game
                </div>
                <div className="font-body-md text-base sm:text-xl text-on-surface-variant mt-1">
                  What should we build next?
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-3xl sm:text-4xl">
              chevron_right
            </span>
          </button>
        </div>
      </section>

      <SuggestGameModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
      />
    </main>
  );
}