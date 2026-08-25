import { NextResponse } from 'next/server';
import { fetchAllMatches } from '@/lib/fetchAllMatches';
import { getFeaturedMatch, isWomensMatch, isRelevantMatch, isWithinNextWeek } from '@/lib/matchHelpers';

export async function GET() {
    try {
        const merged = await fetchAllMatches();

        const mensPool = merged.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch).filter(isWithinNextWeek);
        const womensPool = merged.filter(isWomensMatch).filter(isRelevantMatch).filter(isWithinNextWeek);

        const mens = getFeaturedMatch(mensPool);
        const womens = getFeaturedMatch(womensPool);

        return NextResponse.json(
            { mens, womens },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (err) {
        console.error('Failed to fetch featured match:', err);
        return NextResponse.json({ mens: null, womens: null }, { status: 500 });
    }
}