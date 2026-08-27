'use client';

import { useState, useEffect } from 'react';
import { useProfileContext } from '@/app/_components/ProfileProvider';
import { supabase } from '@/lib/supabase';
import { getMatchStatusLabel, formatMatchDate } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export default function PredictMatchPage({
    params,
}: {
    params: Promise<{ matchId: string }>;
}) {
    const [matchId, setMatchId] = useState<string | null>(null);
    const { userId } = useProfileContext();

    const [match, setMatch] = useState<MatchSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [existingStatus, setExistingStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        params.then((p) => setMatchId(p.matchId));
    }, [params]);

    useEffect(() => {
        if (!matchId) return;

        fetch('/api/matches')
            .then((res) => res.json())
            .then((data) => {
                const found = (data.matches ?? []).find((m: MatchSummary) => m.id === matchId);
                setMatch(found ?? null);
                if (found) {
                    track(ANALYTICS_EVENTS.PREDICT_MATCH_SELECTED, {
                        match_id: matchId,
                        match_name: found.name,
                        match_type: found.matchType,
                    });
                }
            })
            .catch(() => setMatch(null))
            .finally(() => setLoading(false));
    }, [matchId]);

    useEffect(() => {
        if (!matchId || !userId) return;

        supabase
            .from('predictions')
            .select('predicted_team, status')
            .eq('user_id', userId)
            .eq('match_id', matchId)
            .maybeSingle()
            .then(({ data }) => {
                if (data) {
                    setSelectedTeam(data.predicted_team);
                    setExistingStatus(data.status);
                }
            });
    }, [matchId, userId]);

    async function handlePredict(team: string) {
        if (!userId || !matchId || !match) return;

        setSaving(true);
        setSaved(false);

        const { error } = await supabase.from('predictions').upsert(
            {
                user_id: userId,
                match_id: matchId,
                match_name: match.name,
                predicted_team: team,
                status: 'pending',
            },
            { onConflict: 'user_id,match_id' }
        );

        setSaving(false);

        if (!error) {
            setSelectedTeam(team);
            setExistingStatus('pending');
            setSaved(true);
            track(ANALYTICS_EVENTS.PREDICTION_SUBMITTED, {
                match_id: matchId,
                match_name: match.name,
                predicted_team: team,
                match_type: match.matchType,
            });
        }
    }

    if (loading) {
        return (
            <main className="w-full max-w-[700px] mx-auto px-4 pt-8 pb-12">
                <p className="text-sm text-on-surface-variant font-body-md">Loading match...</p>
            </main>
        );
    }

    if (!match) {
        return (
            <main className="w-full max-w-[700px] mx-auto px-4 pt-8 pb-12">
                <p className="text-sm text-on-surface-variant font-body-md">Match not found.</p>
            </main>
        );
    }

    const statusLabel = getMatchStatusLabel(match);
    const locked = statusLabel !== 'upcoming'; // can only predict/change before match starts
    const teams = match.teams ?? [];

    return (
        <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
            <div className="bg-surface-container rounded-xl p-5 mb-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <span className="text-[10px] font-mono-code font-bold text-on-surface-variant tracking-widest uppercase">
                        Match Details
                    </span>
                    <p className="font-headline font-bold text-base text-primary mt-2">
                        {teams[0]} vs {teams[1]}
                    </p>
                </div>

                <div className="text-left sm:text-right">
                    <p className="font-headline font-bold text-sm text-on-surface">
                        {match.matchType?.toUpperCase()}
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 sm:justify-end mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {match.venue}
                    </p>
                    <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1 sm:justify-end mt-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {match.status || formatMatchDate(match.date)}
                    </p>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h2 className="font-headline font-bold text-lg text-primary mb-1">
                    Predict the Winner
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant mb-6">
                    🪙 Win 100 coins if you predict correctly
                </p>

                {locked && existingStatus === null && (
                    <p className="text-sm text-on-surface-variant font-body-md mb-4">
                        Predictions are closed — this match has already started.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {teams.slice(0, 2).map((team) => {
                        const isSelected = selectedTeam === team;
                        return (
                            <button
                                key={team}
                                disabled={locked || saving}
                                onClick={() => handlePredict(team)}
                                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-outline-variant hover:border-secondary'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-on-surface">
                                    {team.slice(0, 3).toUpperCase()}
                                </div>
                                <span className="font-headline font-bold text-sm text-on-surface">
                                    {team}
                                </span>
                                {isSelected && (
                                    <span className="text-xs font-bold text-primary font-mono-code">
                                        YOUR PICK
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {saved && (
                    <p className="text-sm text-secondary font-body-md font-bold mt-5 text-center">
                        Prediction saved! Check back after the match ends.
                    </p>
                )}

                {existingStatus === 'won' && (
                    <p className="text-sm text-pitch-green font-body-md font-bold mt-5 text-center">
                        🎉 You predicted correctly — 100 coins added to your wallet!
                    </p>
                )}
                {existingStatus === 'lost' && (
                    <p className="text-sm text-on-surface-variant font-body-md mt-5 text-center">
                        This prediction didn't win. Better luck next time!
                    </p>
                )}
                {existingStatus === 'void' && (
                    <p className="text-sm text-on-surface-variant font-body-md mt-5 text-center">
                        This match had no clear result — no coins awarded either way.
                    </p>
                )}
            </div>
        </main>
    );
}