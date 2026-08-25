import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/cricapi';
import { getFeaturedMatch, isWomensMatch, isRelevantMatch, isWithinNextWeek } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        const matches = await getLiveMatches().catch((e) => {
            console.error('FEATURED CricAPI ERROR:', e.message);
            return [];
        });

        const seen = new Set<string>();
        const merged: MatchSummary[] = (matches ?? []).filter((m) => {
            if (!m.id || seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        const mensPool = merged.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch).filter(isWithinNextWeek);
        const womensPool = merged.filter(isWomensMatch).filter(isRelevantMatch).filter(isWithinNextWeek);

        const mens = getFeaturedMatch(mensPool.length > 0 ? mensPool : merged.filter((m) => !isWomensMatch(m)));
        const womens = getFeaturedMatch(womensPool.length > 0 ? womensPool : merged.filter(isWomensMatch));

        return NextResponse.json({ mens, womens });
    } catch (err) {
        console.error('Failed to fetch featured match:', err);
        return NextResponse.json({ mens: null, womens: null }, { status: 500 });
    }
}