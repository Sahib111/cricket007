import type { MatchSummary } from './cricapi';

const BASE_URL = 'https://cricbuzz-cricket.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

async function cricbuzzFetch<T>(path: string): Promise<T> {
    if (!RAPIDAPI_KEY) {
        throw new Error('RAPIDAPI_KEY is not set in environment variables');
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        throw new Error(`Cricbuzz request failed: ${res.status} on ${path}`);
    }

    return res.json();
}

// ── Types ──
export interface CricbuzzMatchInfo {
    matchId: number;
    seriesId: number;
    seriesName: string;
    matchDesc: string;
    matchFormat: string;
    startDate: string;
    endDate: string;
    state: string;
    status: string;
    team1: { teamId: number; teamName: string; teamSName: string };
    team2: { teamId: number; teamName: string; teamSName: string };
    venueInfo?: { ground: string; city: string };
    scoreData?: any;
}

// ── Upcoming matches ──
export async function getUpcomingSchedules(): Promise<CricbuzzMatchInfo[]> {
    const data = await cricbuzzFetch<any>('/matches/v1/upcoming');
    const results: CricbuzzMatchInfo[] = [];

    const typeMatches = data?.typeMatches ?? [];
    for (const type of typeMatches) {
        const seriesMatches = type?.seriesMatches ?? [];
        for (const series of seriesMatches) {
            const matches = series?.seriesAdWrapper?.matches ?? [];
            for (const m of matches) {
                if (m.matchInfo) results.push(m.matchInfo);
            }
        }
    }

    return results;
}

// ── Live matches ──
export async function getLiveMatchesCricbuzz(): Promise<CricbuzzMatchInfo[]> {
    const data = await cricbuzzFetch<any>('/matches/v1/live');
    const results: CricbuzzMatchInfo[] = [];

    const typeMatches = data?.typeMatches ?? [];
    for (const type of typeMatches) {
        const seriesMatches = type?.seriesMatches ?? [];
        for (const series of seriesMatches) {
            const matches = series?.seriesAdWrapper?.matches ?? [];
            for (const m of matches) {
                if (m.matchInfo) {
                    results.push({ ...m.matchInfo, scoreData: m.matchScore });
                }
            }
        }
    }

    return results;
}

// ── Recent (completed) matches — used only if needed elsewhere ──
export async function getRecentMatchesCricbuzz(): Promise<CricbuzzMatchInfo[]> {
    const data = await cricbuzzFetch<any>('/matches/v1/recent');
    const results: CricbuzzMatchInfo[] = [];

    const typeMatches = data?.typeMatches ?? [];
    for (const type of typeMatches) {
        const seriesMatches = type?.seriesMatches ?? [];
        for (const series of seriesMatches) {
            const matches = series?.seriesAdWrapper?.matches ?? [];
            for (const m of matches) {
                if (m.matchInfo) {
                    results.push({ ...m.matchInfo, scoreData: m.matchScore });
                }
            }
        }
    }

    return results;
}

// ── Match scorecard ──
export interface CricbuzzBatsman {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strkrate: string;
    outdec: string;
}

export interface CricbuzzBowler {
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: string;
}

export interface CricbuzzInnings {
    inningsid: number;
    batteamname: string;
    batteamsname: string;
    score: number;
    wickets: number;
    overs: number;
    runrate: number;
    batsman: CricbuzzBatsman[];
    bowler: CricbuzzBowler[];
}

export interface CricbuzzScorecard {
    scorecard: CricbuzzInnings[];
    status: string;
    ismatchcomplete: boolean;
}

export async function getMatchScorecard(matchId: number): Promise<CricbuzzScorecard> {
    return cricbuzzFetch<CricbuzzScorecard>(`/mcenter/v1/${matchId}/hscard`);
}

// ── Convert to app's shared MatchSummary shape ──
export function toMatchSummary(m: CricbuzzMatchInfo): MatchSummary {
    const dateMs = Number(m.startDate);
    const dateIso = !isNaN(dateMs) ? new Date(dateMs).toISOString() : '';

    const score: { r: number; w: number; o: number; inning: string }[] = [];
    const sd = m.scoreData;
    if (sd) {
        const t1 = sd.team1Score?.inngs1;
        const t2 = sd.team2Score?.inngs1;
        if (t1) score.push({ r: t1.runs ?? 0, w: t1.wickets ?? 0, o: t1.overs ?? 0, inning: `${m.team1?.teamName} Inning 1` });
        if (t2) score.push({ r: t2.runs ?? 0, w: t2.wickets ?? 0, o: t2.overs ?? 0, inning: `${m.team2?.teamName} Inning 1` });
    }

    return {
        id: String(m.matchId),
        name: m.matchDesc ? `${m.team1?.teamName} vs ${m.team2?.teamName}, ${m.matchDesc}, ${m.seriesName}` : m.seriesName,
        status: m.status,
        matchType: m.matchFormat,
        venue: m.venueInfo ? `${m.venueInfo.ground}, ${m.venueInfo.city}` : '',
        date: dateIso,
        teams: [m.team1?.teamName, m.team2?.teamName].filter(Boolean) as string[],
        score: score.length > 0 ? score : undefined,
    };
}
// ── Full schedule (further-out international fixtures) ──
export async function getInternationalSchedule(): Promise<CricbuzzMatchInfo[]> {
    const data = await cricbuzzFetch<any>('/schedule/v1/international');
    const results: CricbuzzMatchInfo[] = [];

    const matchScheduleMap = data?.matchScheduleMap ?? [];
    for (const entry of matchScheduleMap) {
        const wrapper = entry?.scheduleAdWrapper;
        if (!wrapper) continue; // skip ad entries

        const matchScheduleList = wrapper?.matchScheduleList ?? [];
        for (const series of matchScheduleList) {
            const seriesName = series?.seriesName ?? '';
            const matchInfo = series?.matchInfo ?? [];
            for (const m of matchInfo) {
                results.push({ ...m, seriesName });
            }
        }
    }

    return results;
}