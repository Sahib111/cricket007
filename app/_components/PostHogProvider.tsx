'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { getPostHog } from '@/lib/posthog';

const POSTHOG_KEY = 'phc_yweTSyoTJ5TSJFAqR8xT6FTxco3WH2z7EBKDBQMjDA8x';
const POSTHOG_HOST = 'https://us.i.posthog.com';

/* ─── Pageview tracker ──────────────────────────────────────────── */
function PageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const ph = usePostHog();

    useEffect(() => {
        if (ph && pathname) {
            const url = window.origin + pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
            ph.capture('$pageview', { $current_url: url });
        }
    }, [pathname, searchParams, ph]);

    return null;
}

/* ─── Provider ──────────────────────────────────────────────────── */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!POSTHOG_KEY) return;

        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            person_profiles: 'identified_only',
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: true,
        });
    }, []);

    if (!POSTHOG_KEY) {
        return <>{children}</>;
    }

    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PageviewTracker />
            </Suspense>
            {children}
        </PHProvider>
    );
}
