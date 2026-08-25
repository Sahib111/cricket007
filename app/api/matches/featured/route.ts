import { NextResponse } from 'next/server';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';
import { getFeaturedMatch, isWomensMatch, isRelevantMatch, isWithinNextWeek } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        const [live, upcoming, schedule] = await Promise.all([
            getLiveMatchesCricbuzz().catch((e) => { console.error('FEATURED LIVE ERROR:', e.message); return []; }),
            getUpcomingSchedules().catch((e) => { console.error('FEATURED UPCOMING ERROR:', e.message); return []; }),
            getInternationalSchedule().catch((e) => { console.error('FEATURED SCHEDULE ERROR:', e.message); return []; }),
        ]);

        const liveConverted = live.map(toMatchSummary);
        const upcomingConverted = upcoming.map(toMatchSummary);
        const scheduleConverted = schedule.map(toMatchSummary);

        const seen = new Set<string>();
        const merged: MatchSummary[] = [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        const mensPool = merged.filter((m) => !isWomensMatch(m)).filter(isRelevantMatch).filter(isWithinNextWeek);
        const womensPool = merged.filter(isWomensMatch).filter(isRelevantMatch).filter(isWithinNextWeek);

        const mens = getFeaturedMatch(mensPool);
        const womens = getFeaturedMatch(womensPool);

        return NextResponse.json({ mens, womens });
    } catch (err) {
        console.error('Failed to fetch featured match:', err);
        return NextResponse.json({ mens: null, womens: null }, { status: 500 });
    }
}