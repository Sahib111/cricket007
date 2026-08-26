'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { MatchSummary } from '@/lib/cricapi';
import { getMatchStatusLabel, isWomensMatch, isRelevantMatch } from '@/lib/matchHelpers';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

type MatchStatus = 'live' | 'upcoming';

interface PredictMatch {
  id: string;
  status: MatchStatus;
  series: string;
  teamA: { code: string; name: string };
  teamB: { code: string; name: string };
  note: string;
}

const FALLBACK_MENS: PredictMatch[] = [
  {
    id: 'sample-ind-aus',
    status: 'upcoming',
    series: 'Sample Match',
    teamA: { code: 'IND', name: 'India' },
    teamB: { code: 'AUS', name: 'Australia' },
    note: 'Check back closer to game day',
  },
];

const FALLBACK_WOMENS: PredictMatch[] = [
  {
    id: 'sample-w-ind-eng',
    status: 'upcoming',
    series: "Sample Women's Match",
    teamA: { code: 'IND', name: 'India' },
    teamB: { code: 'ENG', name: 'England' },
    note: 'Check back closer to game day',
  },
];

function toPredictMatch(match: MatchSummary): PredictMatch {
  const statusLabel = getMatchStatusLabel(match);
  const teams = match.teams ?? ['TBD', 'TBD'];

  return {
    id: match.id,
    status: statusLabel === 'live' ? 'live' : 'upcoming',
    series: match.matchType?.toUpperCase() ?? 'Match',
    teamA: { code: teams[0]?.slice(0, 3).toUpperCase() ?? 'TBD', name: teams[0] ?? 'TBD' },
    teamB: { code: teams[1]?.slice(0, 3).toUpperCase() ?? 'TBD', name: teams[1] ?? 'TBD' },
    note: match.status ?? '',
  };
}

export default function PredictPage() {
  const [tab, setTab] = useState<'mens' | 'womens'>('mens');
  const [rawMatches, setRawMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  /* Temporarily disabled match fetching & filtering
  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => setRawMatches(data.matches ?? []))
      .catch(() => setRawMatches([]))
      .finally(() => setLoading(false));
  }, []);

  const genderFiltered = rawMatches.filter((m) =>
    tab === 'womens' ? isWomensMatch(m) : !isWomensMatch(m)
  );

  const notCompleted = genderFiltered.filter((m) => getMatchStatusLabel(m) !== 'result');

  const relevant = notCompleted.filter(isRelevantMatch);
  const finalRealMatches = (relevant.length > 0 ? relevant : notCompleted)
    .sort((a, b) => {
      const order = { live: 0, upcoming: 1, result: 2 };
      return order[getMatchStatusLabel(a)] - order[getMatchStatusLabel(b)];
    })
    .slice(0, 3)
    .map(toPredictMatch);

  const matches =
    finalRealMatches.length > 0
      ? finalRealMatches
      : tab === 'mens'
        ? FALLBACK_MENS
        : FALLBACK_WOMENS;
  */

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12 min-h-[60vh] flex flex-col justify-center items-center">
      {/* Temporarily commented out predict content:
      <h1 className="font-headline font-extrabold text-primary text-2xl sm:text-3xl">
        Predict and Win Coins
      </h1>
      <p className="font-body-md text-sm text-on-surface-variant mt-1 mb-5">
        Choose the Match
      </p>

      <div className="inline-flex bg-surface-container rounded-lg p-1 mb-6 border border-outline-variant">
        <button
          onClick={() => { setTab('mens'); track(ANALYTICS_EVENTS.GENDER_TOGGLED, { gender: 'mens', source: 'predict' }); }}
          className={`px-5 py-1.5 rounded-md text-sm font-headline font-semibold transition-all ${tab === 'mens'
            ? 'bg-surface-container-lowest text-on-surface shadow-sm'
            : 'text-on-surface-variant'
            }`}
        >
          Mens
        </button>
        <button
          onClick={() => { setTab('womens'); track(ANALYTICS_EVENTS.GENDER_TOGGLED, { gender: 'womens', source: 'predict' }); }}
          className={`px-5 py-1.5 rounded-md text-sm font-headline font-semibold transition-all ${tab === 'womens'
            ? 'bg-surface-container-lowest text-on-surface shadow-sm'
            : 'text-on-surface-variant'
            }`}
        >
          Womens
        </button>
      </div>

      {loading && (
        <p className="text-sm text-on-surface-variant font-body-md">Loading matches...</p>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            ...
          ))}
        </div>
      )}
      */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm my-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl sm:text-4xl">
            online_prediction
          </span>
        </div>
        <h1 className="font-headline font-extrabold text-primary text-2xl sm:text-3xl mb-2">
          Predictions Coming Soon
        </h1>
        <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md">
          Predict match outcomes and win coins! Match prediction contests will open as upcoming matches are scheduled.
        </p>
      </div>
    </main>
  );
}