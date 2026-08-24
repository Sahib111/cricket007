import { NextResponse } from 'next/server';
import { getSeriesInfo } from '@/lib/cricapi';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ seriesId: string }> }
) {
    const { seriesId } = await params;
    try {
        const series = await getSeriesInfo(seriesId);
        return NextResponse.json({ series });
    } catch (err) {
        console.error('Failed to fetch series info:', err);
        return NextResponse.json({ series: null }, { status: 500 });
    }
}