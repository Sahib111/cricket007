import Link from 'next/link';
import { fetchAllMatches } from '@/lib/fetchAllMatches';
import { HomeMatchCards } from './_components/HomeMatchCards';
import { HomeTrackedLink } from './_components/HomeTrackedLink';
import { ANALYTICS_EVENTS } from '@/lib/analytics';

export const revalidate = 1800; // revalidate at most every 30 mins (same as Cricbuzz fetch interval)

export default async function HomePage() {
  const matches = await fetchAllMatches().catch(() => []);

  return (
    <main className="flex-grow flex flex-col w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12 gap-8">
      {/* Mens/Womens Toggle & Match Cards (Client Component for active tab state & filtering) */}
      <HomeMatchCards matches={matches} />

      {/* Predict & Win Banner */}
      <HomeTrackedLink
        href="/predict"
        event={ANALYTICS_EVENTS.PREDICT_BANNER_CLICKED}
        eventProps={{ source: 'home' }}
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
      </HomeTrackedLink>

      {/* Test Your Knowledge */}
      <section aria-labelledby="games-heading" className="flex flex-col gap-6 w-full mt-4">
        <h2
          id="games-heading"
          className="font-headline font-extrabold text-primary border-b-2 border-secondary pb-4 text-3xl sm:text-4xl tracking-tight"
        >
          Test Your Knowledge
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <HomeTrackedLink
            id="card-wordle"
            href="/games/wordle"
            event={ANALYTICS_EVENTS.GAME_CARD_CLICKED}
            eventProps={{ game: 'wordle', source: 'home' }}
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
                  Daily Player Guess
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary group-hover:translate-x-1 transition-all text-3xl sm:text-4xl">
              chevron_right
            </span>
          </HomeTrackedLink>

          <HomeTrackedLink
            id="card-auction"
            href="/games/auction"
            event={ANALYTICS_EVENTS.GAME_CARD_CLICKED}
            eventProps={{ game: 'auction', source: 'home' }}
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
          </HomeTrackedLink>

          <HomeTrackedLink
            id="card-guess-cricketer"
            href="/games/guess-cricketer"
            event={ANALYTICS_EVENTS.GAME_CARD_CLICKED}
            eventProps={{ game: 'guess-cricketer', source: 'home' }}
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
          </HomeTrackedLink>
        </div>
      </section>
    </main>
  );
}