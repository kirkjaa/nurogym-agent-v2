/**
 * Coach Agent Template - Configuration Loader
 *
 * Loads and caches the coach configuration from a JSON file.
 * The config path can be set via COACH_CONFIG_PATH environment variable,
 * defaulting to ./config/coach.sample.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { CoachConfig } from './types';

let cachedConfig: CoachConfig | null = null;

/**
 * Default configuration used as fallback when no config file is found
 */
const defaultConfig: CoachConfig = {
    version: '1.0.0',
    identity: {
        name: 'Coach',
        persona: 'helpful AI coaching assistant',
        createdBy: 'Coach Agent Template',
        gender: 'neutral',
        defaultLanguage: 'en',
    },
    expertise: {
        domain: 'General Coaching',
        areas: [
            {
                id: 'core',
                name: 'Core Knowledge',
                description: 'General coaching and guidance',
            },
        ],
        terminology: [],
    },
    safety: {
        enabled: true,
        rules: [
            {
                id: 'professional',
                trigger: 'medical, legal, financial advice',
                instruction: 'Recommend consulting a qualified professional',
            },
        ],
    },
    webSearch: {
        enabled: true,
        queryPrefix: '',
        timeSensitivePatterns: ['latest', 'recent', 'current', 'news'],
    },
    behavior: {
        openingGreeting: "Hello! I'm your AI coaching assistant. How can I help you today?",
        prohibitions: [
            'Do not provide medical diagnoses',
            'Do not give specific legal or financial advice',
        ],
    },
    localStorage: {
        keyPrefix: 'coach-agent',
    },
};

/**
 * Get the path to the coach configuration file
 */
function getConfigPath(): string {
    const envPath = process.env.COACH_CONFIG_PATH;
    if (envPath) {
        // If it's an absolute path, use it directly
        if (path.isAbsolute(envPath)) {
            return envPath;
        }
        // Otherwise, resolve relative to current working directory
        return path.resolve(process.cwd(), envPath);
    }
    // Default path
    return path.resolve(process.cwd(), './config/coach.sample.json');
}

/**
 * Load and return the coach configuration
 *
 * The configuration is loaded once and cached for subsequent calls.
 * If the config file is not found, returns the default configuration.
 *
 * @returns The coach configuration object
 */
export function getCoachConfig(): CoachConfig {
    if (cachedConfig) {
        return cachedConfig;
    }

    const configPath = getConfigPath();

    try {
        if (fs.existsSync(configPath)) {
            const configContent = fs.readFileSync(configPath, 'utf-8');
            const loadedConfig = JSON.parse(configContent) as CoachConfig;

            // Merge with defaults to ensure all fields exist
            cachedConfig = {
                ...defaultConfig,
                ...loadedConfig,
                identity: { ...defaultConfig.identity, ...loadedConfig.identity },
                expertise: { ...defaultConfig.expertise, ...loadedConfig.expertise },
                safety: { ...defaultConfig.safety, ...loadedConfig.safety },
                webSearch: { ...defaultConfig.webSearch, ...loadedConfig.webSearch },
                behavior: { ...defaultConfig.behavior, ...loadedConfig.behavior },
                localStorage: { ...defaultConfig.localStorage, ...loadedConfig.localStorage },
            };
        } else {
            console.warn(`Coach config not found at ${configPath}, using defaults`);
            cachedConfig = defaultConfig;
        }
    } catch (error) {
        console.error(`Error loading coach config from ${configPath}:`, error);
        cachedConfig = defaultConfig;
    }

    return cachedConfig;
}

/**
 * Clear the cached configuration (useful for testing or hot-reloading)
 */
export function clearConfigCache(): void {
    cachedConfig = null;
}

/**
 * Get the default configuration
 */
export function getDefaultConfig(): CoachConfig {
    return { ...defaultConfig };
}
