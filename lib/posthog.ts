import posthog from 'posthog-js';

/**
 * Returns the posthog instance.
 * Initialization is handled by PostHogProvider — this is just a getter.
 */
export function getPostHog() {
    if (typeof window === 'undefined') return null;
    return posthog;
}
