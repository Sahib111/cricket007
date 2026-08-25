'use client';

import { useState, useEffect, use } from 'react';
import type { CricbuzzScorecard } from '@/lib/cricbuzz';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export default function MatchScoreboardPage({
    params,
}: {
    params: Promise<{ matchId: string }>;
}) {
    const { matchId } = use(params);
    const [data, setData] = useState<CricbuzzScorecard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/match/${matchId}`)
            .then((res) => res.json())
            .then((d) => {
                setData(d.scorecard);
                if (d.scorecard) {
                    track(ANALYTICS_EVENTS.SCORECARD_VIEWED, { match_id: matchId });
                }
            })
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [matchId]);

    if (loading) {
        return (
            <main className="w-full max-w-[700px] mx-auto px-4 pt-8 pb-12">
                <p className="text-sm text-on-surface-variant font-body-md">Loading scoreboard...</p>
            </main>
        );
    }

    if (!data?.scorecard || data.scorecard.length === 0) {
        return (
            <main className="w-full max-w-[700px] mx-auto px-4 pt-8 pb-12">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center shadow-sm">
                    <p className="text-base font-bold text-on-surface font-headline mb-2">Scorecard Unavailable</p>
                    <p className="text-xs text-on-surface-variant font-body-md mb-4">Detailed ball-by-ball scorecard will update live as soon as play starts.</p>
                    <a href="/" className="inline-block bg-primary text-on-primary px-4 py-2 rounded-md text-xs font-bold font-headline">Back to Matches</a>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-6 shadow-sm">
                <div className="mt-1 pt-1 text-center">
                    <span className="font-body-md text-sm text-on-surface-variant">{data.status}</span>
                </div>
            </div>

            {data.scorecard.map((innings, i) => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-4 shadow-sm">
                    <p className="font-headline font-bold text-sm text-primary mb-3">
                        {innings.batteamname} — {innings.score}/{innings.wickets} ({innings.overs} ov)
                    </p>

                    <table className="w-full text-xs font-body-md">
                        <thead>
                            <tr className="text-on-surface-variant border-b border-outline-variant">
                                <th className="text-left py-1">Batter</th>
                                <th className="text-right py-1">R</th>
                                <th className="text-right py-1">B</th>
                                <th className="text-right py-1">4s</th>
                                <th className="text-right py-1">6s</th>
                                <th className="text-right py-1">SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.batsman?.map((b, j) => (
                                <tr key={j} className="border-b border-outline-variant/50">
                                    <td className="py-1">
                                        {b.name}
                                        <span className="block text-[10px] text-on-surface-variant">{b.outdec || 'not out'}</span>
                                    </td>
                                    <td className="text-right font-bold">{b.runs}</td>
                                    <td className="text-right">{b.balls}</td>
                                    <td className="text-right">{b.fours}</td>
                                    <td className="text-right">{b.sixes}</td>
                                    <td className="text-right">{b.strkrate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <p className="font-headline font-bold text-xs text-primary mt-4 mb-2">Bowling</p>
                    <table className="w-full text-xs font-body-md">
                        <thead>
                            <tr className="text-on-surface-variant border-b border-outline-variant">
                                <th className="text-left py-1">Bowler</th>
                                <th className="text-right py-1">O</th>
                                <th className="text-right py-1">M</th>
                                <th className="text-right py-1">R</th>
                                <th className="text-right py-1">W</th>
                                <th className="text-right py-1">Econ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.bowler?.map((b, j) => (
                                <tr key={j} className="border-b border-outline-variant/50">
                                    <td className="py-1">{b.name}</td>
                                    <td className="text-right">{b.overs}</td>
                                    <td className="text-right">{b.maidens}</td>
                                    <td className="text-right">{b.runs}</td>
                                    <td className="text-right font-bold">{b.wickets}</td>
                                    <td className="text-right">{b.economy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </main>
    );
}