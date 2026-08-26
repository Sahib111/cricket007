'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { MatchSummary } from '@/lib/cricapi';
import { getTeamScore } from '@/lib/matchHelpers';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';
import SuggestGameModal from '@/app/_components/SuggestGameModal';

export default function GamesPage() {
    const [featured, setFeatured] = useState<MatchSummary | null>(null);
    const [showSuggestModal, setShowSuggestModal] = useState(false);

    useEffect(() => {
        fetch('/api/matches/featured')
            .then((res) => res.json())
            .then((data) => setFeatured(data.mens ?? data.womens ?? null))
            .catch(() => setFeatured(null));
    }, []);

    return (
        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
            <h1 className="font-headline font-bold text-primary text-lg mb-4">
                Minigames
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Game Cards Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Link
                        href="/games/wordle"
                        onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'wordle', source: 'games_hub' })}
                        className="group relative rounded-xl overflow-hidden border border-outline-variant h-[220px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-pitch-green/10 to-pitch-green/5 hover:shadow-md transition-all"
                    >
                        <span className="material-symbols-outlined text-5xl text-pitch-green mb-3">
                            sports_cricket
                        </span>
                        <h3 className="font-headline font-bold text-on-surface text-base">
                            Cricket Wordle
                        </h3>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            Guess the player of the day
                        </p>
                    </Link>

                    <Link
                        href="/games/auction"
                        onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'auction', source: 'games_hub' })}
                        className="group relative rounded-xl overflow-hidden border border-outline-variant h-[220px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-stadium-blue/10 to-stadium-blue/5 hover:shadow-md transition-all"
                    >
                        <span className="material-symbols-outlined text-5xl text-stadium-blue mb-3">
                            groups
                        </span>
                        <h3 className="font-headline font-bold text-on-surface text-base">
                            Build Your Team
                        </h3>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            Mini auction madness
                        </p>
                    </Link>

                    <Link
                        href="/games/guess-cricketer"
                        onClick={() => track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game: 'guess-cricketer', source: 'games_hub' })}
                        className="group relative rounded-xl overflow-hidden border border-outline-variant h-[220px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-secondary/10 to-secondary/5 hover:shadow-md transition-all"
                    >
                        <span className="material-symbols-outlined text-5xl text-secondary mb-3">
                            search
                        </span>
                        <h3 className="font-headline font-bold text-on-surface text-base">
                            Guess the Cricketer
                        </h3>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            Detective mode activated
                        </p>
                    </Link>

                    <button
                        onClick={() => setShowSuggestModal(true)}
                        className="rounded-xl border-2 border-dashed border-outline-variant h-[220px] flex flex-col items-center justify-center text-center bg-surface-container-lowest hover:bg-surface-container transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl text-outline mb-3">
                            add_circle
                        </span>
                        <h3 className="font-headline font-bold text-primary text-base">
                            Suggest a Game
                        </h3>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            What should we build next?
                        </p>
                    </button>
                </div>

                {/* Right: Sidebar */}
                <aside className="w-full lg:w-[280px] flex flex-col gap-4">
                    {/* Live Match Widget */}
                    <div className="bg-surface-container-lowest border border-outline-variant border-t-4 border-t-secondary rounded-xl p-4 shadow-sm">
                        {featured ? (
                            <>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="flex items-center gap-1 text-live text-xs font-bold font-mono-code">
                                        <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                                        {featured.status?.toLowerCase().includes('won') ? 'RESULT' : 'LIVE'}
                                    </span>
                                    <span className="text-on-surface-variant text-[11px] font-mono-code">
                                        {featured.matchType?.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2.5 my-1">
                                    {featured.teams?.slice(0, 2).map((team, i) => (
                                        <div key={team} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">
                                                    {team.slice(0, 3).toUpperCase()}
                                                </div>
                                                <span className="font-headline font-bold text-sm text-on-surface">{team}</span>
                                            </div>
                                            <span className="font-headline font-bold text-sm text-on-surface">
                                                {getTeamScore(featured, i) ?? '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2.5 border-t border-outline-variant flex justify-center">
                                    <Link href={`/match/${featured.id}`} className="flex items-center gap-1 text-xs font-headline font-bold text-secondary hover:underline">
                                        View Scorecard
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-on-surface-variant font-body-md text-center py-4">
                                No live matches right now
                            </p>
                        )}
                    </div>

                    {/* Predict and Win Button */}
                    <Link
                        href="/predict"
                        className="w-full bg-gradient-to-br from-secondary to-secondary-container text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-headline font-bold text-sm hover:shadow-md transition-all"
                    >
                        Predict and Win
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                </aside>
            </div>

            <SuggestGameModal
                isOpen={showSuggestModal}
                onClose={() => setShowSuggestModal(false)}
            />
        </main>
    );
}
