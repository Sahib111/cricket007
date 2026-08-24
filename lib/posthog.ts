import posthog from 'posthog-js';


let posthogInitialized = false;

export function getPostHog() {
    if (typeof window === 'undefined') return null;


    if (!posthogInitialized) {
        posthog.init('phc_yweTSyoTJ5TSJFAqR8xT6FTxco3WH2z7EBKDBQMjDA8x', {
            api_host: 'https://us.i.posthog.com',

            person_profiles: 'identified_only',
            capture_pageview: false,   // we handle this manually via the PageviewTracker
            capture_pageleave: true,
            autocapture: true,
        });
        posthogInitialized = true;
    }

    return posthog;
}
