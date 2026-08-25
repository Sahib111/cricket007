import { NextResponse } from 'next/server';
import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from '@/lib/cricbuzz';
import { getLiveMatches as getCricApiMatches } from '@/lib/cricapi';
import { isRelevantMatch } from '@/lib/matchHelpers';
import type { MatchSummary } from '@/lib/cricapi';

export async function GET() {
    try {
        let matches: MatchSummary[] = [];

        // 1. Primary source: RapidAPI / Cricbuzz
        try {
            const [live, upcoming, schedule] = await Promise.all([
                getLiveMatchesCricbuzz().catch((e) => { console.error('RapidAPI Live Error:', e.message); return []; }),
                getUpcomingSchedules().catch((e) => { console.error('RapidAPI Upcoming Error:', e.message); return []; }),
                getInternationalSchedule().catch((e) => { console.error('RapidAPI Schedule Error:', e.message); return []; }),
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

        // 2. Fallback to CricAPI if RapidAPI yields no matches (e.g. 429 quota or 403 subscription error)
        if (matches.length === 0) {
            console.log('RapidAPI returned 0 matches. Falling back to CricAPI...');
            const cricApiMatches = await getCricApiMatches().catch(() => []);
            const seen = new Set<string>();
            matches = (cricApiMatches ?? []).filter((m) => {
                if (!m.id || seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
            });
        }

        // Filter strictly for ICC / International TOP_TEAMS matches
        const relevantMatches = matches.filter(isRelevantMatch);

        return NextResponse.json({ matches: relevantMatches.length > 0 ? relevantMatches : matches });
    } catch (err) {
        console.error('Failed to fetch matches:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch matches' }, { status: 500 });
    }
}