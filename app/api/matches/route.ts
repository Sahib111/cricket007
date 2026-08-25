import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/cricapi';

export async function GET() {
    try {
        const matches = await getLiveMatches().catch((e) => {
            console.error('CricAPI LIVE ERROR:', e.message);
            return [];
        });

        // dedupe by id — CricAPI currentMatches
        const seen = new Set<string>();
        const merged = (matches ?? []).filter((m) => {
            if (!m.id || seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        return NextResponse.json({ matches: merged });
    } catch (err) {
        console.error('Failed to fetch matches from CricAPI:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
    }
}