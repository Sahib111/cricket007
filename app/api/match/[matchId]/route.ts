import { NextResponse } from 'next/server';
import { getMatchScorecard, getLiveMatchesCricbuzz, toMatchSummary } from '@/lib/cricbuzz';
import { getLiveMatches as getCricApiMatches } from '@/lib/cricapi';
import type { MatchSummary } from '@/lib/cricapi';

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

        // 2. Search match summary across CricAPI and Cricbuzz
        const [cricApiList, cricbuzzList] = await Promise.all([
            getCricApiMatches().catch(() => []),
            getLiveMatchesCricbuzz().catch(() => []),
        ]);

        const cricbuzzConverted = cricbuzzList.map(toMatchSummary);
        const combined: MatchSummary[] = [...cricApiList, ...cricbuzzConverted];

        const found = combined.find((m) => String(m.id) === String(matchId));

        if (found) {
            const scoreInnings = (found.score || []).map((s, idx) => ({
                inningsid: idx + 1,
                batteamname: s.inning || found.teams[idx] || `Team ${idx + 1}`,
                batteamsname: found.teams[idx] || `T${idx + 1}`,
                score: s.r,
                wickets: s.w,
                overs: s.o,
                runrate: s.o > 0 ? Number((s.r / s.o).toFixed(2)) : 0,
                batsman: [],
                bowler: [],
            }));

            const finalScorecard = scoreInnings.length > 0 ? scoreInnings : (found.teams || []).map((t, idx) => ({
                inningsid: idx + 1,
                batteamname: t,
                batteamsname: t,
                score: 0,
                wickets: 0,
                overs: 0,
                runrate: 0,
                batsman: [],
                bowler: [],
            }));

            const scorecard = {
                scorecard: finalScorecard,
                status: found.status || found.name || 'Match In Progress',
                ismatchcomplete: found.status?.toLowerCase().includes('won') ?? false,
            };

            return NextResponse.json({ scorecard });
        }

        return NextResponse.json({ scorecard: null });
    } catch (err) {
        console.error('Failed to fetch scorecard:', err);
        return NextResponse.json({ scorecard: null }, { status: 500 });
    }
}