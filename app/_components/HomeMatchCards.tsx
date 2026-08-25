'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MatchSummary } from '@/lib/cricapi';
import { getMatchStatusLabel, getTeamScore, isWomensMatch, isRelevantMatch, isWithinNextWeek, formatMatchDate } from '@/lib/matchHelpers';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export function HomeMatchCards({ matches }: { matches: MatchSummary[] }) {
  const [activeGender, setActiveGender] = useState<'mens' | 'womens'>('mens');

  const relevantOnly = matches
    .filter((m) => (activeGender === 'womens' ? isWomensMatch(m) : !isWomensMatch(m)))
    .filter(isRelevantMatch)
    .filter(isWithinNextWeek);

  const filteredMatches = relevantOnly.sort((a, b) => {
    const order = { live: 0, upcoming: 1, result: 2 };
    return order[getMatchStatusLabel(a)] - order[getMatchStatusLabel(b)];
  });

  return (
    <>
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
      <div className="flex overflow-x-auto snap-x gap-4 w-full pb-2">
        {filteredMatches.length === 0 && (
          <div className="text-on-surface-variant font-body-md text-sm py-8">
            No {activeGender === 'womens' ? "women's" : "men's"} matches this week.
          </div>
        )}

        {filteredMatches.slice(0, 6).map((match) => {
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
    </>
  );
}
