import { NextResponse } from 'next/server';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';
import { getLiveMatches as getCricApiMatches } from '@/lib/cricapi';
import { getFeaturedMatch, isWomensMatch, isRelevantMatch } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        let matches: MatchSummary[] = [];

        // 1. Primary source: RapidAPI / Cricbuzz
        try {
            const [live, upcoming, schedule] = await Promise.all([
                getLiveMatchesCricbuzz().catch(() => []),
                getUpcomingSchedules().catch(() => []),
                getInternationalSchedule().catch(() => []),
            ]);

            const liveConverted = live.map(toMatchSummary);
            const upcomingConverted = upcoming.map(toMatchSummary);
            const scheduleConverted = schedule.map(toMatchSummary);

            const cbSeen = new Set<string>();
            matches = [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
                if (!m.id || cbSeen.has(m.id)) return false;
                cbSeen.add(m.id);
                return true;
            });
        } catch (err) {
            console.error('RapidAPI Primary Fetch Failed:', err);
        }

        // 2. Fallback to CricAPI if RapidAPI yields no matches
        if (matches.length === 0) {
            const cricApiMatches = await getCricApiMatches().catch(() => []);
            const seen = new Set<string>();
            matches = (cricApiMatches ?? []).filter((m) => {
                if (!m.id || seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
            });
        }

        const mensPool = matches.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch);
        const womensPool = matches.filter(isWomensMatch).filter(isRelevantMatch);

        const mens = getFeaturedMatch(mensPool.length > 0 ? mensPool : matches.filter((m) => !isWomensMatch(m)));
        const womens = getFeaturedMatch(womensPool.length > 0 ? womensPool : matches.filter(isWomensMatch));

        return NextResponse.json({ mens, womens });
    } catch (err) {
        console.error('Failed to fetch featured match:', err);
        return NextResponse.json({ mens: null, womens: null }, { status: 500 });
    }
}