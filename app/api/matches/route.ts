import { NextResponse } from 'next/server';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';

export async function GET() {
    try {
        const [live, upcoming, schedule] = await Promise.all([
            getLiveMatchesCricbuzz().catch((e) => { console.error('LIVE ERROR:', e.message); return []; }),
            getUpcomingSchedules().catch((e) => { console.error('UPCOMING ERROR:', e.message); return []; }),
            getInternationalSchedule().catch((e) => { console.error('SCHEDULE ERROR:', e.message); return []; }),
        ]);

        const liveConverted = live.map(toMatchSummary);
        const upcomingConverted = upcoming.map(toMatchSummary);
        const scheduleConverted = schedule.map(toMatchSummary);

        // dedupe by id — live takes priority, then upcoming, then schedule
        const seen = new Set<string>();
        const merged = [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        return NextResponse.json({ matches: merged });
    } catch (err) {
        console.error('Failed to fetch matches from Cricbuzz:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
    }
}