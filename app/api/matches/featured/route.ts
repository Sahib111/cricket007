import { NextResponse } from 'next/server';
import { getLiveMatches as getCricApiMatches } from '@/lib/cricapi';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';
import { getFeaturedMatch, isWomensMatch, isRelevantMatch, isWithinNextWeek } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        const matches: MatchSummary[] = await getCricApiMatches().catch(() => []);

        const seen = new Set<string>();
        let merged: MatchSummary[] = (matches ?? []).filter((m) => {
            if (!m.id || seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        let mensPool = merged.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch).filter(isWithinNextWeek);
        let womensPool = merged.filter(isWomensMatch).filter(isRelevantMatch).filter(isWithinNextWeek);

        if (mensPool.length === 0 && womensPool.length === 0) {
            const [live, upcoming, schedule] = await Promise.all([
                getLiveMatchesCricbuzz().catch(() => []),
                getUpcomingSchedules().catch(() => []),
                getInternationalSchedule().catch(() => []),
            ]);

            const liveConverted = live.map(toMatchSummary);
            const upcomingConverted = upcoming.map(toMatchSummary);
            const scheduleConverted = schedule.map(toMatchSummary);

            const cbSeen = new Set<string>();
            merged = [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
                if (cbSeen.has(m.id)) return false;
                cbSeen.add(m.id);
                return true;
            });

            mensPool = merged.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch).filter(isWithinNextWeek);
            womensPool = merged.filter(isWomensMatch).filter(isRelevantMatch).filter(isWithinNextWeek);
        }

        const mens = getFeaturedMatch(mensPool.length > 0 ? mensPool : merged.filter((m) => !isWomensMatch(m)));
        const womens = getFeaturedMatch(womensPool.length > 0 ? womensPool : merged.filter(isWomensMatch));

        return NextResponse.json({ mens, womens });
    } catch (err) {
        console.error('Failed to fetch featured match:', err);
        return NextResponse.json({ mens: null, womens: null }, { status: 500 });
    }
}