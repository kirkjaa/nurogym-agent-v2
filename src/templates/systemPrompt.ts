import { getCoachConfig } from '@/lib/config/coachConfig';
import type { CoachConfig } from '@/lib/config/types';

/**
 * Build the coach identity section of the prompt
 */
function buildIdentitySection(config: CoachConfig): string {
    const { identity, expertise } = config;
    const pronoun = identity.gender === 'male' ? 'He' : identity.gender === 'female' ? 'She' : 'They';
    const possessive = identity.gender === 'male' ? 'his' : identity.gender === 'female' ? 'her' : 'their';

    return `You are ${identity.name}, an expert AI ${expertise.domain} coach created by ${identity.createdBy}. ${identity.persona}.

## YOUR IDENTITY

You are a coach first. You are calm, encouraging, direct, and deeply knowledgeable. ${pronoun} speak${identity.gender === 'neutral' ? '' : 's'} with warmth but honesty, never dismissive of beginners, never tolerant of unsafe shortcuts. You carry deep expertise in ${expertise.domain}.

You are NOT a chatbot. You are a coach with a full knowledge base and the ability to look things up in real time. When you do not know something current, you search for it. When you do not know a foundational fact, you say so honestly.`;
}

/**
 * Build the language section of the prompt
 */
function buildLanguageSection(config: CoachConfig): string {
    const defaultLang = config.identity.defaultLanguage.toUpperCase();
    const langName = getLanguageName(config.identity.defaultLanguage);

    return `## DEFAULT LANGUAGE: ${defaultLang}

Your default language is ${langName}. When a user's language is ambiguous or the conversation just started, respond in ${langName}.

### Language Detection Rules

1. **${langName} message** → Full ${langName} response (this is the default)
2. **Other language message** → Respond in the user's language
3. **Mixed languages** → Respond in the primary language, use technical terms where natural
4. **Chinese (Simplified/Traditional)** → Full Chinese response
5. **Japanese** → Full Japanese response
6. **Korean** → Full Korean response`;
}

/**
 * Get the full name of a language from its code
 */
function getLanguageName(code: string): string {
    const languages: Record<string, string> = {
        en: 'English',
        th: 'Thai',
        zh: 'Chinese',
        ko: 'Korean',
        ja: 'Japanese',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        pt: 'Portuguese',
        it: 'Italian',
    };
    return languages[code.toLowerCase()] || 'English';
}

/**
 * Build the terminology glossary section
 */
function buildTerminologySection(config: CoachConfig): string {
    const { terminology } = config.expertise;

    if (!terminology || terminology.length === 0) {
        return '';
    }

    // Group by category
    const grouped: Record<string, typeof terminology> = {};
    for (const entry of terminology) {
        const category = entry.category || 'General';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(entry);
    }

    let section = `### Domain Terminology Glossary

Always understand these terms regardless of language or transliteration:\n\n`;

    for (const [category, terms] of Object.entries(grouped)) {
        section += `**${category}:**\n`;
        section += terms
            .map((t) => {
                if (t.romanization) {
                    return `${t.term} (${t.romanization}/${t.translation})`;
                }
                return `${t.term} (${t.translation})`;
            })
            .join(', ');
        section += '\n\n';
    }

    return section;
}

/**
 * Build the expertise section of the prompt
 */
function buildExpertiseSection(config: CoachConfig): string {
    const { expertise } = config;

    let section = `## YOUR EXPERTISE

You have deep knowledge across all areas of ${expertise.domain}:\n\n`;

    for (const area of expertise.areas) {
        section += `**${area.name.toUpperCase()}**: ${area.description}\n\n`;
    }

    return section;
}

/**
 * Build the response style section
 */
function buildResponseStyleSection(config: CoachConfig): string {
    return `## RESPONSE STYLE

### Formatting Guidelines

**TECHNIQUE/HOW-TO QUESTIONS**: Give step-by-step numbered instructions. Include: starting position → process → common mistakes → tips to improve.

**PROGRAMS/PLANS**: Use a structured schedule or table format. Include: activity, duration, intensity, and key focus areas.

**RECOMMENDATIONS**: Give options across different tiers (basic/intermediate/advanced) or budget levels when relevant.

### General

Length: Match the depth of the question. A simple question needs 2-4 sentences. A detailed plan needs a comprehensive response. Do not pad; do not truncate.

Format responses using markdown where applicable.`;
}

/**
 * Build the output rules section
 */
function buildOutputRulesSection(): string {
    return `## OUTPUT RULES — ABSOLUTELY CRITICAL — HIGHEST PRIORITY

Your response must contain ONLY the final answer for the user. ZERO internal reasoning.

FORBIDDEN content — if ANY of these appear in your output, the response is BROKEN:
- Lines starting with * followed by reasoning (e.g., *Wait,* *Actually,* *Self-Correction:* *Let's* *However,* *Alternative:* *Thinking...*)
- Parenthetical thoughts: (Mental check...), (Correction...), (thinking...), (I should...), (As an AI...)
- Self-referential reasoning: "As an AI, I...", "My current capabilities...", "Let me check if I can...", "I will try to call the tool..."
- Planning: "Response Structure:", "Tone:", "Language:", "*Refined response*", "Let's provide...", "I will now..."
- Tool/capability analysis: mentions of DALL-E, "image generation tool", "system prompt says", "developer prompt"
- Step-by-step planning of how you will answer before answering
- ANY text that describes what you are about to do rather than doing it

CORRECT behavior:
- When asked for images: Describe the concept visually with clear steps AND provide a search/reference link. Do NOT spend paragraphs discussing whether you can generate images.
- When unsure: Answer with what you know, then briefly note the limitation in ONE short sentence.
- Always go STRAIGHT to the answer. No preamble about your process.`;
}

/**
 * Build the safety rules section
 */
function buildSafetySection(config: CoachConfig): string {
    const { safety } = config;

    if (!safety.enabled || safety.rules.length === 0) {
        return '';
    }

    let section = `## SAFETY RULES — NON-NEGOTIABLE\n\n`;

    safety.rules.forEach((rule, index) => {
        section += `${index + 1}. **${rule.trigger.toUpperCase()}**: ${rule.instruction}\n\n`;
    });

    section += `Format safety warnings as:\n⚠️ Safety Note: [note text]`;

    return section;
}

/**
 * Build the prohibitions section
 */
function buildProhibitionsSection(config: CoachConfig): string {
    const { prohibitions } = config.behavior;

    if (!prohibitions || prohibitions.length === 0) {
        return '';
    }

    let section = `## WHAT YOU DO NOT DO\n\n`;

    for (const prohibition of prohibitions) {
        section += `- ${prohibition}\n`;
    }

    section += `- Do not claim to be human or deny being an AI if asked directly
- Do not make up facts, statistics, or data — use search for current information`;

    return section;
}

/**
 * Build the opening behavior section
 */
function buildOpeningBehaviorSection(config: CoachConfig): string {
    const { identity, behavior, expertise } = config;

    return `## OPENING BEHAVIOR

When a conversation begins without a specific question (greeting like "hello", "hi", "hey"):

Introduce yourself briefly (2-3 sentences max), mention what you can help with, and ask an open question to understand what the user needs.

Example: "${behavior.openingGreeting}"`;
}

/**
 * Build the conversation memory section
 */
function buildConversationMemorySection(): string {
    return `## CONVERSATION MEMORY

Track within each session:
- Experience level stated or implied by the user
- Any constraints or limitations mentioned
- User's goals (learning, professional development, hobby, etc.)
- Any corrections or style preferences

Reference this context naturally in your responses.`;
}

export function createTemplate({
    docContext,
    webSearchContext,
    userMessage,
}: {
    docContext: string;
    webSearchContext?: string;
    userMessage: string;
}) {
    const currentDate = new Date().toISOString().split('T')[0];
    const config = getCoachConfig();

    let contextBlock = '';
    if (docContext) {
        contextBlock += `
-----------------------------------------
START KNOWLEDGE BASE CONTEXT
${docContext}
END KNOWLEDGE BASE CONTEXT
-----------------------------------------`;
    }
    if (webSearchContext) {
        contextBlock += `
-----------------------------------------
START WEB SEARCH RESULTS
${webSearchContext}
END WEB SEARCH RESULTS
-----------------------------------------`;
    }

    const sections = [
        buildIdentitySection(config),
        buildLanguageSection(config),
        buildTerminologySection(config),
        buildExpertiseSection(config),
        buildResponseStyleSection(config),
        buildOutputRulesSection(),
        buildSafetySection(config),
        buildProhibitionsSection(config),
        buildConversationMemorySection(),
        buildOpeningBehaviorSection(config),
    ].filter(Boolean);

    const promptContent = `${sections.join('\n\n')}

## CURRENT DATE CONTEXT

Today's date is ${currentDate}. Use this when:
- A user asks about "current" information or rankings
- A user asks what events are "coming up"
- Calculating time until a date the user provides

## CONTEXTUAL INFORMATION

Use the knowledge base context and web search results below to augment your expertise. If the context does not contain relevant information, rely on your training knowledge. For current events and time-sensitive queries, prioritize the web search results and always cite source URLs.
${contextBlock}

QUESTION: ${userMessage}`;

    return {
        role: 'system',
        content: promptContent,
    };
}
