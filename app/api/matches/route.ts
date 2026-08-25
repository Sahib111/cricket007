import { NextResponse } from 'next/server';
import { getLiveMatches as getCricApiMatches } from '@/lib/cricapi';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';
import { isRelevantMatch } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        // 1. Try CricAPI first
        const cricApiMatches: MatchSummary[] = await getCricApiMatches().catch((e) => {
            console.error('CricAPI Error:', e.message);
            return [];
        });

        const seen = new Set<string>();
        let merged = (cricApiMatches ?? []).filter((m) => {
            if (!m.id || seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        // Check if CricAPI produced any ICC/international matches from TOP_TEAMS
        const relevantCricApi = merged.filter(isRelevantMatch);

        // 2. Fallback to RapidAPI / Cricbuzz if CricAPI produced no relevant TOP_TEAMS matches
        if (relevantCricApi.length === 0) {
            console.log('Falling back to Cricbuzz / RapidAPI...');
            const [live, upcoming, schedule] = await Promise.all([
                getLiveMatchesCricbuzz().catch((e) => { console.error('LIVE ERROR:', e.message); return []; }),
                getUpcomingSchedules().catch((e) => { console.error('UPCOMING ERROR:', e.message); return []; }),
                getInternationalSchedule().catch((e) => { console.error('SCHEDULE ERROR:', e.message); return []; }),
            ]);

            const liveConverted = live.map(toMatchSummary);
            const upcomingConverted = upcoming.map(toMatchSummary);
            const scheduleConverted = schedule.map(toMatchSummary);

            const cbSeen = new Set<string>();
            const cbMerged = [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
                if (cbSeen.has(m.id)) return false;
                cbSeen.add(m.id);
                return true;
            });

            if (cbMerged.length > 0) {
                merged = cbMerged;
            }
        }

        return NextResponse.json({ matches: merged });
    } catch (err) {
        console.error('Failed to fetch matches:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
    }
}