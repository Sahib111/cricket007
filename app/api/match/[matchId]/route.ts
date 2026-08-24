import { NextResponse } from 'next/server';
import { getMatchScorecard } from '@/lib/cricbuzz';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params;
    try {
        const scorecard = await getMatchScorecard(Number(matchId));
        return NextResponse.json({ scorecard });
    } catch (err) {
        console.error('Failed to fetch scorecard:', err);
        return NextResponse.json({ scorecard: null }, { status: 500 });
    }
}