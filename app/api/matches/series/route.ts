import { NextResponse } from 'next/server';

import { getSeriesInfo } from '@/lib/cricapi';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');

    if (!seriesId) {
        return NextResponse.json(
            { error: 'seriesId is required' },
            { status: 400 }
        );
    }

    try {
        const series = await getSeriesInfo(seriesId);

        return NextResponse.json({ series });
    } catch (err) {
        console.error('Failed to fetch series info:', err);

        return NextResponse.json(
            { series: null },
            { status: 500 }
        );
    }
}