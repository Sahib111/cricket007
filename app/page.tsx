'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { MatchSummary } from '@/lib/cricapi';
import { getMatchStatusLabel, getTeamScore, isWomensMatch, isRelevantMatch, isWithinNextWeek, formatMatchDate } from '@/lib/matchHelpers';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';
import SuggestGameModal from '@/app/_components/SuggestGameModal';

export default function HomePage() {
  const [activeGender, setActiveGender] = useState<'mens' | 'womens'>('mens');
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
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
      {/* Mens/Womens Toggle */}
      <div className="flex p-1 bg-surface-container-highest rounded-lg w-full md:w-fit md:mr-auto border border-outline-variant">
        <button
          type="button"
          onClick={() => { setActiveGender('mens'); track(ANALYTICS_EVENTS.GENDER_TOGGLED, { gender: 'mens' }); }}
          className={`flex-1 md:px-12 py-2 rounded-md font-headline font-bold text-sm transition-all cursor-pointer ${activeGender === 'mens'
            ? 'bg-surface text-on-surface shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
        >
          Mens
        </button>
        <button
          type="button"
          onClick={() => { setActiveGender('womens'); track(ANALYTICS_EVENTS.GENDER_TOGGLED, { gender: 'womens' }); }}
          className={`flex-1 md:px-12 py-2 rounded-md font-headline font-bold text-sm transition-all cursor-pointer ${activeGender === 'womens'
            ? 'bg-surface text-on-surface shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
        >
          Womens
        </button>
      </div>

      {/* Live/Upcoming Match Cards */}
      {/* Temporarily commented out live match cards:
      <div className="flex overflow-x-auto snap-x gap-4 w-full pb-2">
        {loading && (
          <div className="text-on-surface-variant font-body-md text-sm py-8">Loading matches...</div>
        )}

        {!loading && filteredMatches.length === 0 && (
          <div className="text-on-surface-variant font-body-md text-sm py-8">
            No {activeGender === 'womens' ? "women's" : "men's"} matches this week.
          </div>
        )}

        {!loading && filteredMatches.slice(0, 6).map((match) => {
          const statusLabel = getMatchStatusLabel(match);
          const scoreA = getTeamScore(match, 0);
          const scoreB = getTeamScore(match, 1);

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              onClick={() => track(ANALYTICS_EVENTS.MATCH_CARD_CLICKED, { match_id: match.id, match_name: match.name, status: statusLabel })}
              className={`min-w-[300px] sm:min-w-[320px] w-80 md:w-96 snap-start shrink-0 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all ${statusLabel === 'live' ? 'border-t-4 border-t-secondary' : ''
                }`}
            >
              <div className="flex justify-between items-center font-mono-code text-xs font-semibold">
                {statusLabel === 'live' ? (
                  <span className="font-bold text-live-red flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-live-red animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="font-bold text-on-surface px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] uppercase">
                    {statusLabel}
                  </span>
                )}
                <span className="text-on-surface-variant text-[11px]">
                  {match.matchType?.toUpperCase()} • {match.venue}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {match.teams?.slice(0, 2).map((team, i) => (
                  <div key={team} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-surface-container-highest rounded-full flex items-center justify-center font-headline font-bold text-xs text-on-surface">
                        {team.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="font-headline font-bold text-sm sm:text-base text-on-surface">
                        {team}
                      </span>
                    </div>
                    <span className="font-headline font-extrabold text-on-surface text-sm sm:text-base">
                      {i === 0 ? scoreA : scoreB}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-on-surface-variant font-body-md mt-auto pt-2 text-sm font-medium line-clamp-2">
                {match.status || formatMatchDate(match.date)}
              </div>
            </Link>
          );
        })}
      </div>
      */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-6 sm:py-5 sm:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center sm:text-left shadow-sm">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl sm:text-2xl">
            sports_cricket
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
            Live Scores Coming Soon
          </h3>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            We're working on bringing you real-time match coverage, ball-by-ball updates, and live scorecards. Stay tuned!
          </p>
        </div>
      </div>

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
                  Daily Player Guess
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