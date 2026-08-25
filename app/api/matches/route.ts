import { NextResponse } from 'next/server';
import { fetchAllMatches } from '@/lib/fetchAllMatches';

export async function GET() {
    try {
        const matches = await fetchAllMatches();

        return NextResponse.json(
            { matches },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (err) {
        console.error('Failed to fetch matches from Cricbuzz:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
    }
}