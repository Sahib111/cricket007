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

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
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
            <div
              key={match.id}
              className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col ${match.status === 'live' ? 'border-l-4 border-l-live' : 'border-l-4 border-l-primary'
                }`}
            >
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  {match.status === 'live' ? (
                    <span className="flex items-center gap-1 text-live text-xs font-bold font-mono-code">
                      <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Upcoming
                    </span>
                  )}
                  <span className="text-on-surface-variant text-[11px] font-mono-code">
                    {match.series}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-xs font-bold text-on-surface">
                      {match.teamA.code}
                    </div>
                    <span className="font-body-md text-xs text-on-surface-variant">
                      {match.teamA.name}
                    </span>
                  </div>

                  <span className="font-headline text-xs font-semibold text-on-surface-variant">
                    VS
                  </span>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-xs font-bold text-on-surface">
                      {match.teamB.code}
                    </div>
                    <span className="font-body-md text-xs text-on-surface-variant">
                      {match.teamB.name}
                    </span>
                  </div>
                </div>

                <div className="mt-3 mb-4 text-center">
                  <span
                    className={`font-mono-code text-xs ${match.status === 'live' ? 'text-secondary font-bold' : 'text-on-surface-variant'
                      }`}
                  >
                    {match.note}
                  </span>
                </div>

                <Link
                  href={`/predict/${match.id}`}
                  onClick={() => track(ANALYTICS_EVENTS.PREDICT_MATCH_SELECTED, { match_id: match.id, team_a: match.teamA.name, team_b: match.teamB.name, status: match.status })}
                  className={`mt-auto w-full text-center rounded-lg py-2.5 font-headline font-bold text-sm text-white transition-all hover:opacity-90 ${match.status === 'live' ? 'bg-secondary' : 'bg-primary'
                    }`}
                >
                  Predict Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}