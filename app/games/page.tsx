'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';
import SuggestGameModal from '@/app/_components/SuggestGameModal';

export default function GamesPage() {
    const [showSuggestModal, setShowSuggestModal] = useState(false);

    return (
        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
            <h1 className="font-headline font-bold text-primary text-lg mb-4">
                Minigames
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
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
                        Guess the Word of the day
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

            <SuggestGameModal
                isOpen={showSuggestModal}
                onClose={() => setShowSuggestModal(false)}
            />
        </main>
    );
}
