const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICAPI_KEY;

interface CricApiResponse<T> {
    status: string;
    data: T;
}

export interface MatchSummary {
    id: string;
    name: string;
    status: string;
    matchType: string;
    venue: string;
    date: string;
    teams: string[];
    teamInfo?: { name: string; shortname: string; img: string }[];
    score?: { r: number; w: number; o: number; inning: string }[];
}

export interface SquadPlayer {
    id: string;
    name: string;
    role?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    country?: string;
}

export interface MatchSquadResponse {
    id: string;
    name: string;
    teams: string[];
    players: {
        teamName: string;
        shortname: string;
        players: SquadPlayer[];
    }[];
}

async function cricApiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!API_KEY) {
        throw new Error('CRICAPI_KEY is not set in environment variables');
    }

    const query = new URLSearchParams({ apikey: API_KEY, ...params });
    const res = await fetch(`${BASE_URL}/${endpoint}?${query.toString()}`, {
        next: { revalidate: 60 }, // cache 60s to avoid burning rate limit
    });

    if (!res.ok) {
        throw new Error(`CricAPI request failed: ${res.status}`);
    }

    const json: CricApiResponse<T> = await res.json();

    if (json.status !== 'success') {
        throw new Error(`CricAPI error: ${JSON.stringify(json)}`);
    }

    return json.data;
}

function parseCricScoreToSummary(item: any): MatchSummary {
    const parseScoreStr = (s: string, teamName: string) => {
        if (!s) return null;
        const match = s.match(/(\d+)(?:\/(\d+))?\s*(?:\(([\d.]+)\s*ov\))?/);
        if (!match) return null;
        return {
            r: parseInt(match[1], 10) || 0,
            w: match[2] ? parseInt(match[2], 10) : 0,
            o: match[3] ? parseFloat(match[3]) : 0,
            inning: `${teamName} Inning 1`,
        };
    };

    const cleanTeam = (t: string) => (t || '').replace(/\[.*?\]/g, '').trim();
    const team1 = cleanTeam(item.t1);
    const team2 = cleanTeam(item.t2);

    const s1 = parseScoreStr(item.t1s, team1);
    const s2 = parseScoreStr(item.t2s, team2);
    const scores = [s1, s2].filter(Boolean) as { r: number; w: number; o: number; inning: string }[];

    return {
        id: item.id,
        name: `${team1} vs ${team2}, ${item.series || item.matchType || ''}`,
        status: item.ms === 'live' ? (item.status || 'LIVE') : item.status,
        matchType: item.matchType || 't20',
        venue: item.series || '',
        date: item.dateTimeGMT || '',
        teams: [team1, team2],
        score: scores.length > 0 ? scores : undefined,
    };
}

/** Get list of current/live and upcoming matches from all CricAPI endpoints */
export async function getLiveMatches(): Promise<MatchSummary[]> {
    const [current, cricScoreData, upcoming] = await Promise.all([
        cricApiFetch<MatchSummary[]>('currentMatches', { offset: '0' }).catch(() => []),
        cricApiFetch<any[]>('cricScore').catch(() => []),
        cricApiFetch<MatchSummary[]>('matches', { offset: '0' }).catch(() => []),
    ]);

    const cricScoreConverted = (cricScoreData || []).map(parseCricScoreToSummary);

    const seen = new Set<string>();
    return [...(current || []), ...cricScoreConverted, ...(upcoming || [])].filter((m) => {
        if (!m.id || seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
    });
}

/** Get detailed match info by match id */
export async function getMatchInfo(matchId: string): Promise<MatchSummary> {
    return cricApiFetch<MatchSummary>('match_info', { id: matchId });
}

/** Get playing squad (Playing XI pool) for a match */
export async function getMatchSquad(matchId: string): Promise<MatchSquadResponse> {
    return cricApiFetch<MatchSquadResponse>('match_squad', { id: matchId });
}

export interface SeriesInfo {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    matches: number;
}

export async function getUpcomingSeries(): Promise<SeriesInfo[]> {
    return cricApiFetch<SeriesInfo[]>('series', { offset: '0' });
}

export interface SeriesMatch {
    id: string;
    name: string;
    status: string;
    matchType: string;
    date: string;
    teams: string[];
}

export interface SeriesInfoResponse {
    id: string;
    name: string;
    matchList: SeriesMatch[];
}

export async function getSeriesInfo(seriesId: string): Promise<SeriesInfoResponse> {
    return cricApiFetch<SeriesInfoResponse>('series_info', { id: seriesId });
}