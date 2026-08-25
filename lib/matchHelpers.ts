import type { MatchSummary } from './cricapi';

export function getMatchStatusLabel(match: MatchSummary): 'live' | 'result' | 'upcoming' {
    const status = match.status?.toLowerCase() ?? '';

    if (!status) return 'upcoming'; // schedule-endpoint matches have no status text yet

    if (
        status.includes('won') ||
        status.includes('drawn') ||
        status.includes('abandon') ||
        status.includes('tied') ||
        status.includes('no result') ||
        status.includes('cancelled')
    ) return 'result';
    if (
        status.includes('will start') ||
        status.includes('scheduled') ||
        status.includes('toss') ||
        status.includes('preview') ||
        status.includes('match starts at') ||
        status.includes('not started')
    ) return 'upcoming';
    return 'live';
}

export function formatMatchDate(dateIso: string): string {
    if (!dateIso) return '';
    const date = new Date(dateIso);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function getTeamScore(match: MatchSummary, teamIndex: number) {
    const score = match.score?.[teamIndex];
    if (!score) return null;
    return `${score.r}/${score.w} (${score.o} ov)`;
}

export function isWomensMatch(match: MatchSummary): boolean {
    const name = match.name?.toLowerCase() ?? '';
    const teams = match.teams?.join(' ').toLowerCase() ?? '';
    return name.includes('women') || name.includes('w vs') || name.includes(" w'") || teams.includes('women');
}

export function getFeaturedMatch(matches: MatchSummary[]): MatchSummary | null {
    if (matches.length === 0) return null;
    const live = matches.find((m) => getMatchStatusLabel(m) === 'live');
    if (live) return live;
    const upcoming = matches.find((m) => getMatchStatusLabel(m) === 'upcoming');
    return upcoming ?? matches[0];
}

const TOP_TEAMS = [
    'india', 'australia', 'england', 'pakistan', 'new zealand', 'south africa',
    'sri lanka', 'bangladesh', 'afghanistan', 'west indies', 'zimbabwe', 'ireland',
    'scotland', 'netherlands', 'uae', 'nepal', 'oman', 'usa', 'united states',
    'canada', 'china', 'indonesia', 'namibia', 'thailand'
];

export function isRelevantMatch(match: MatchSummary): boolean {
    const teams = match.teams?.map((t) => t.toLowerCase()) ?? [];
    if (teams.length < 2) return false;
    return teams.some((team) => TOP_TEAMS.some((t) => team.includes(t))) || teams.length === 2;
}

export function isWithinNextWeek(match: MatchSummary): boolean {
    const status = getMatchStatusLabel(match);
    if (status === 'result') return false;
    if (status === 'live') return true;

    if (!match.date) return true;
    const matchDate = new Date(match.date).getTime();
    const now = Date.now();
    // Allow matches within 14 days or any upcoming match without strict cutoff if pool is small
    const rangeAhead = now + 14 * 24 * 60 * 60 * 1000;
    return matchDate >= (now - 24 * 60 * 60 * 1000) && matchDate <= rangeAhead;
}

export function getMatchWinner(match: MatchSummary): string | null {
    const status = match.status?.toLowerCase() ?? '';
    if (!status.includes('won')) return null;
    const teams = match.teams ?? [];
    return teams.find((t) => status.includes(`${t.toLowerCase()} won`)) ?? null;
}