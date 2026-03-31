/**
 * Coach Agent Template - Configuration Types
 *
 * This file defines the TypeScript interfaces for the coach configuration.
 * The configuration allows you to customize the coach's identity, expertise,
 * behavior, and various operational settings.
 */

export interface CoachIdentity {
    /** Display name of the coach (e.g., "Coach", "Mentor", "Advisor") */
    name: string;
    /** Brief description of the coach's persona */
    persona: string;
    /** Organization or individual that created this coach */
    createdBy: string;
    /** Gender for pronoun usage: "male", "female", or "neutral" */
    gender: 'male' | 'female' | 'neutral';
    /** Default language code (ISO 639-1): "en", "th", "zh", "ko", "ja" */
    defaultLanguage: string;
}

export interface ExpertiseArea {
    /** Unique identifier for this expertise area */
    id: string;
    /** Display name of the expertise area */
    name: string;
    /** Description of what this area covers */
    description: string;
}

export interface TerminologyEntry {
    /** The term in the primary/native language */
    term: string;
    /** Romanization or pronunciation guide (optional) */
    romanization?: string;
    /** English translation */
    translation: string;
    /** Category for grouping (optional) */
    category?: string;
}

export interface CoachExpertise {
    /** The primary domain/field of expertise (e.g., "Fitness", "Music", "Cooking") */
    domain: string;
    /** List of expertise areas the coach can help with */
    areas: ExpertiseArea[];
    /** Domain-specific terminology glossary */
    terminology: TerminologyEntry[];
}

export interface SafetyRule {
    /** Unique identifier for this safety rule */
    id: string;
    /** Keywords or patterns that trigger this rule */
    trigger: string;
    /** Instruction for how to handle this trigger */
    instruction: string;
}

export interface CoachSafety {
    /** Whether safety rules are enabled */
    enabled: boolean;
    /** List of safety rules */
    rules: SafetyRule[];
}

export interface CoachWebSearch {
    /** Whether web search is enabled */
    enabled: boolean;
    /** Prefix to add to all search queries (e.g., "fitness", "cooking") */
    queryPrefix: string;
    /** Patterns that indicate a time-sensitive query requiring web search */
    timeSensitivePatterns: string[];
}

export interface CoachBehavior {
    /** Greeting message when conversation starts */
    openingGreeting: string;
    /** List of behaviors the coach should never do */
    prohibitions: string[];
}

export interface CoachLocalStorage {
    /** Prefix for localStorage keys (e.g., "coach-agent" becomes "coach-agent-locale") */
    keyPrefix: string;
}

export interface CoachConfig {
    /** Configuration schema version */
    version: string;
    /** Coach identity settings */
    identity: CoachIdentity;
    /** Expertise and domain knowledge settings */
    expertise: CoachExpertise;
    /** Safety rules and guardrails */
    safety: CoachSafety;
    /** Web search configuration */
    webSearch: CoachWebSearch;
    /** Behavioral settings */
    behavior: CoachBehavior;
    /** Local storage settings */
    localStorage: CoachLocalStorage;
}
