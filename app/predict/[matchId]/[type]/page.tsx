'use client';

import { useState, use } from 'react';

const DUMMY_PLAYERS = [
    'Virat Kohli', 'Rohit Sharma', 'Jasprit Bumrah', 'Hardik Pandya',
    'KL Rahul', 'Ravindra Jadeja', 'Mohammed Shami', 'Shubman Gill',
    'Suryakumar Yadav', 'Kuldeep Yadav', 'Steve Smith', 'Pat Cummins',
    'David Warner', 'Glenn Maxwell', 'Mitchell Starc', 'Travis Head',
];

const TYPE_LABELS: Record<string, string> = {
    'playing-xi': 'Predict Playing XI',
    'player-of-match': 'Predict Player of the Match',
    'best-batsman': 'Predict Best Batsman',
    'best-bowler': 'Predict Best Bowler',
};

export default function PredictTypePage({
    params,
}: {
    params: Promise<{ matchId: string; type: string }>;
}) {
    const { matchId, type } = use(params);
    const isPlayingXI = type === 'playing-xi';

    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const filtered = DUMMY_PLAYERS.filter((p) =>
        p.toLowerCase().includes(query.toLowerCase())
    );

    function toggleSelect(name: string) {
        if (isPlayingXI) {
            setSelected((prev) =>
                prev.includes(name)
                    ? prev.filter((n) => n !== name)
                    : prev.length < 11
                        ? [...prev, name]
                        : prev
            );
        } else {
            setSelected([name]);
        }
    }

    function handleSubmit() {
        setSubmitted(true);
    }

    return (
        <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
            <h1 className="font-headline font-extrabold text-primary text-xl sm:text-2xl mb-1">
                {TYPE_LABELS[type] ?? 'Predict'}
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
                {isPlayingXI
                    ? `Select 11 players (${selected.length}/11 chosen)`
                    : 'Search and select a player'}
            </p>

            {/* Search box */}
            <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    search
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a player name..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Player list */}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto mb-6">
                {filtered.map((name) => {
                    const isSelected = selected.includes(name);
                    return (
                        <button
                            key={name}
                            onClick={() => toggleSelect(name)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
                                }`}
                        >
                            <span className="font-body-md text-sm text-on-surface">{name}</span>
                            {isSelected && (
                                <span className="material-symbols-outlined text-primary text-lg">
                                    check_circle
                                </span>
                            )}
                        </button>
                    );
                })}
                {filtered.length === 0 && (
                    <p className="text-center text-sm text-on-surface-variant py-6">
                        No players found
                    </p>
                )}
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={isPlayingXI ? selected.length !== 11 : selected.length === 0}
                className="w-full bg-secondary text-white font-headline font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Submit Prediction
            </button>

            {submitted && (
                <p className="text-center text-sm text-pitch-green font-headline font-bold mt-4">
                    ✅ Prediction submitted for {matchId} — {TYPE_LABELS[type]}
                </p>
            )}
        </main>
    );
}