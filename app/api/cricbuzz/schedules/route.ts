import { NextResponse } from 'next/server';
import { getUpcomingSchedules } from '@/lib/cricbuzz';

export async function GET() {
    try {
        const matches = await getUpcomingSchedules();
        return NextResponse.json({ matches });
    } catch (err) {
        console.error('Failed to fetch Cricbuzz schedules:', err);
        return NextResponse.json({ matches: [], error: 'Failed to fetch schedules' }, { status: 500 });
    }
}