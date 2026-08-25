import { NextResponse } from 'next/server';
import { getMatchScorecard } from '@/lib/cricbuzz';
import { getMatchInfo } from '@/lib/cricapi';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params;
    try {
        const numId = Number(matchId);

        // 1. Try RapidAPI Cricbuzz scorecard first if numeric ID
        if (!isNaN(numId)) {
            const scorecard = await getMatchScorecard(numId).catch(() => null);
            if (scorecard && scorecard.scorecard && scorecard.scorecard.length > 0) {
                return NextResponse.json({ scorecard });
            }
        }

        // 2. Fallback to CricAPI match_info if non-numeric ID or RapidAPI unavailable
        const info = await getMatchInfo(matchId).catch(() => null);
        if (info) {
            const scoreInnings = (info.score || []).map((s, idx) => ({
                inningsid: idx + 1,
                batteamname: s.inning || info.teams[idx] || `Team ${idx + 1}`,
                batteamsname: info.teams[idx] || `T${idx + 1}`,
                score: s.r,
                wickets: s.w,
                overs: s.o,
                runrate: s.o > 0 ? Number((s.r / s.o).toFixed(2)) : 0,
                batsman: [],
                bowler: [],
            }));

            const scorecard = {
                scorecard: scoreInnings,
                status: info.status || 'Match Status Available',
                ismatchcomplete: info.status?.toLowerCase().includes('won') ?? false,
            };

            return NextResponse.json({ scorecard });
        }

        return NextResponse.json({ scorecard: null });
    } catch (err) {
        console.error('Failed to fetch scorecard:', err);
        return NextResponse.json({ scorecard: null }, { status: 500 });
    }
}