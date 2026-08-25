import { getLiveMatchesCricbuzz, getUpcomingSchedules, getInternationalSchedule, toMatchSummary } from './cricbuzz';
import type { MatchSummary } from './cricapi';

/**
 * Shared helper that fetches live, upcoming, and scheduled matches from Cricbuzz,
 * converts them to the app's MatchSummary shape, and deduplicates by ID.
 *
 * Used by both /api/matches and /api/matches/featured to avoid duplicate upstream calls.
 */
export async function fetchAllMatches(): Promise<MatchSummary[]> {
    const [live, upcoming, schedule] = await Promise.all([
        getLiveMatchesCricbuzz().catch((e) => { console.error('LIVE ERROR:', e.message); return []; }),
        getUpcomingSchedules().catch((e) => { console.error('UPCOMING ERROR:', e.message); return []; }),
        getInternationalSchedule().catch((e) => { console.error('SCHEDULE ERROR:', e.message); return []; }),
    ]);

    const liveConverted = live.map(toMatchSummary);
    const upcomingConverted = upcoming.map(toMatchSummary);
    const scheduleConverted = schedule.map(toMatchSummary);

    // Dedupe by id — live takes priority, then upcoming, then schedule
    const seen = new Set<string>();
    return [...liveConverted, ...upcomingConverted, ...scheduleConverted].filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
    });
}
