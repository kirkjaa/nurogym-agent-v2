/**
 * Client-side coach configuration
 *
 * This module provides configuration values that can be used on the client side.
 * The values are injected from environment variables at build time.
 */

export interface ClientCoachConfig {
    coachName: string;
    domain: string;
    storageKeyPrefix: string;
}

/**
 * Get the client-side coach configuration
 *
 * These values come from environment variables that are embedded at build time.
 * For full configuration, use the server-side getCoachConfig() function.
 */
export function getClientConfig(): ClientCoachConfig {
    return {
        coachName: process.env.NEXT_PUBLIC_COACH_NAME || 'Coach',
        domain: process.env.NEXT_PUBLIC_COACH_DOMAIN || '',
        storageKeyPrefix: process.env.NEXT_PUBLIC_STORAGE_KEY_PREFIX || 'coach-agent',
    };
}
