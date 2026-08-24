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

/** Get list of current/live matches */
export async function getLiveMatches(): Promise<MatchSummary[]> {
    return cricApiFetch<MatchSummary[]>('currentMatches', { offset: '0' });
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