import { NextResponse } from 'next/server';
import { getMatchInfo } from '@/lib/cricapi';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params;
    try {
        const match = await getMatchInfo(matchId);
        return NextResponse.json({ match });
    } catch (err) {
        console.error('Failed to fetch match info:', err);
        return NextResponse.json({ match: null }, { status: 500 });
    }
}