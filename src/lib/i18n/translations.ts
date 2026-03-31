export type Locale = 'th' | 'en' | 'zh' | 'ko' | 'ja';

export const LOCALE_LABELS: Record<Locale, string> = {
    th: 'TH',
    en: 'EN',
    zh: '中',
    ko: '한',
    ja: '日',
};

export const LOCALE_SHORT: Record<Locale, string> = {
    th: 'TH',
    en: 'EN',
    zh: '中',
    ko: '한',
    ja: '日',
};

interface SampleMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface Translations {
    headerTitle: string;
    starterText: string;
    placeholder: string;
    clearChat: string;
    clearConfirm: string;
    clearConfirmButton: string;
    cancelButton: string;
    loading: string;
    errorMessage: string;
    welcomeText: string;
    subtitle: string;
    startPrompt: string;
    startButton: string;
    sampleLabel: string;
    prompts: string[];
    sampleConversation: SampleMessage[];
}

/**
 * Raw translations with {{coachName}} and {{domain}} placeholders
 */
const rawTranslations: Record<Locale, Translations> = {
    th: {
        headerTitle: '{{coachName}} — โค้ชออกกำลังกายสำหรับทุกคน',
        starterText: 'สวัสดี! ฉันคือ{{coachName}} เพื่อนออกกำลังกายของคุณจาก NuroGym ฉันพร้อมช่วยคุณเคลื่อนไหว รู้สึกดี และสนุกกับการออกกำลังกาย — ในแบบของคุณ ถามฉันได้เลย!',
        placeholder: 'ถาม{{coachName}}ได้เลย...',
        clearChat: 'ล้างแชท',
        clearConfirm: 'คุณต้องการล้างข้อความแชททั้งหมดใช่ไหม?',
        clearConfirmButton: 'ล้างแชท',
        cancelButton: 'ยกเลิก',
        loading: 'กำลังคิด',
        errorMessage: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        welcomeText: 'ยินดีต้อนรับสู่ NuroGym',
        subtitle: '{{coachName}} — โค้ช{{domain}}',
        startPrompt: 'เริ่มพูดคุยกับ{{coachName}}',
        startButton: 'เริ่มแชท',
        sampleLabel: 'ตัวอย่างบทสนทนา',
        prompts: [
            'ออกกำลังกายอะไรดีสำหรับวันนี้?',
            'แนะนำท่าออกกำลังกายสำหรับผู้ที่นั่งรถเข็น',
            'ฉันรู้สึกเครียด มีวิธีผ่อนคลายไหม?',
            'ผู้ดูแลสามารถช่วยออกกำลังกายได้อย่างไร?',
        ],
        sampleConversation: [
            { role: 'user', content: 'ฉันมีออทิสติก อยากเริ่มออกกำลังกายครั้งแรก ควรเริ่มอย่างไรดี?' },
            { role: 'assistant', content: 'ยินดีมากเลย! เราเริ่มด้วยการเดินเบาๆ 10 นาทีในที่เงียบๆ ที่คุณรู้สึกสบายใจก็ได้เลยนะ ไม่ต้องรีบ เริ่มทีละเล็กน้อยดีที่สุดครับ 🌟' },
        ],
    },
    en: {
        headerTitle: '{{coachName}} — Fitness Coach for Everyone',
        starterText: "Hi! I'm {{coachName}}, your friendly fitness companion from NuroGym. I'm here to help you move, feel good, and have fun — at your own pace. Ask me anything!",
        placeholder: 'Ask {{coachName}} anything...',
        clearChat: 'Clear Chat',
        clearConfirm: 'Are you sure you want to clear the chat?',
        clearConfirmButton: 'Clear Chat',
        cancelButton: 'Cancel',
        loading: 'Thinking',
        errorMessage: 'Something went wrong. Please try again.',
        welcomeText: 'Welcome to NuroGym',
        subtitle: '{{coachName}} — {{domain}} Coach',
        startPrompt: 'Start chatting with {{coachName}}',
        startButton: 'Start Chat',
        sampleLabel: 'Example conversation',
        prompts: [
            'What exercise can I do today?',
            'Suggest a workout for wheelchair users',
            'I feel anxious — what can help?',
            'How can a caregiver help with exercise?',
        ],
        sampleConversation: [
            { role: 'user', content: 'I have autism and want to start exercising for the first time. Where do I begin?' },
            { role: 'assistant', content: "That's wonderful! Let's start simple — a 10-minute walk somewhere quiet that feels comfortable for you. No rush, no pressure. Small steps forward are always a win! 🌟" },
        ],
    },
    zh: {
        headerTitle: '私人AI教练 — {{coachName}}',
        starterText: '你好！我是{{coachName}}，你的AI{{domain}}教练。你可以问我任何问题。',
        placeholder: '向{{coachName}}提问...',
        clearChat: '清除聊天',
        clearConfirm: '确定要清除所有聊天记录吗？',
        clearConfirmButton: '清除聊天',
        cancelButton: '取消',
        loading: '思考中',
        errorMessage: '出现错误，请重试。',
        welcomeText: '你好',
        subtitle: 'AI{{domain}}教练',
        startPrompt: '开始新对话',
        startButton: '开始聊天',
        sampleLabel: '对话示例',
        prompts: [
            '如何开始入门？',
            '帮我制定学习计划',
            '有哪些关键技巧？',
            '讲讲核心概念',
        ],
        sampleConversation: [
            { role: 'user', content: '如何开始入门？' },
            { role: 'assistant', content: '好问题！让我们从基础开始，一步步建立你的技能。' },
        ],
    },
    ko: {
        headerTitle: '개인 AI 코치 — {{coachName}}',
        starterText: '안녕하세요! 저는 {{coachName}}, 당신의 AI {{domain}} 코치입니다. 무엇이든 물어보세요.',
        placeholder: '{{coachName}}에게 질문하기...',
        clearChat: '채팅 지우기',
        clearConfirm: '모든 채팅 기록을 삭제하시겠습니까?',
        clearConfirmButton: '채팅 지우기',
        cancelButton: '취소',
        loading: '생각 중',
        errorMessage: '오류가 발생했습니다. 다시 시도해 주세요.',
        welcomeText: '안녕하세요',
        subtitle: 'AI {{domain}} 코치',
        startPrompt: '새 대화 시작',
        startButton: '채팅 시작',
        sampleLabel: '대화 예시',
        prompts: [
            '어떻게 시작하면 좋을까요?',
            '초보자를 위한 학습 계획을 만들어 주세요',
            '알아야 할 핵심 기술은 무엇인가요?',
            '핵심 개념을 설명해 주세요',
        ],
        sampleConversation: [
            { role: 'user', content: '어떻게 시작하면 좋을까요?' },
            { role: 'assistant', content: '좋은 질문입니다! 기초부터 시작해서 단계별로 실력을 쌓아가겠습니다.' },
        ],
    },
    ja: {
        headerTitle: 'パーソナルAIコーチ — {{coachName}}',
        starterText: 'こんにちは！私は{{coachName}}、あなたのAI{{domain}}コーチです。何でも聞いてください。',
        placeholder: '{{coachName}}に質問する...',
        clearChat: 'チャットを消去',
        clearConfirm: 'すべてのチャット履歴を削除してもよろしいですか？',
        clearConfirmButton: 'チャットを消去',
        cancelButton: 'キャンセル',
        loading: '考え中',
        errorMessage: 'エラーが発生しました。もう一度お試しください。',
        welcomeText: 'ようこそ',
        subtitle: 'AI{{domain}}コーチ',
        startPrompt: '新しい会話を始める',
        startButton: 'チャット開始',
        sampleLabel: '会話の例',
        prompts: [
            '始め方を教えてください',
            '初心者向けの学習プランを作成して',
            '知っておくべき重要なテクニックは？',
            'コアコンセプトを説明して',
        ],
        sampleConversation: [
            { role: 'user', content: '始め方を教えてください' },
            { role: 'assistant', content: '良い質問ですね！基礎から始めて、段階的にスキルを身につけていきましょう。' },
        ],
    },
};

/**
 * Interpolate placeholders in a string with actual values
 */
function interpolate(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] || match);
}

/**
 * Interpolate all string values in a translations object
 */
function interpolateTranslations(translations: Translations, values: Record<string, string>): Translations {
    return {
        headerTitle: interpolate(translations.headerTitle, values),
        starterText: interpolate(translations.starterText, values),
        placeholder: interpolate(translations.placeholder, values),
        clearChat: translations.clearChat,
        clearConfirm: translations.clearConfirm,
        clearConfirmButton: translations.clearConfirmButton,
        cancelButton: translations.cancelButton,
        loading: translations.loading,
        errorMessage: translations.errorMessage,
        welcomeText: translations.welcomeText,
        subtitle: interpolate(translations.subtitle, values),
        startPrompt: translations.startPrompt,
        startButton: translations.startButton,
        sampleLabel: translations.sampleLabel,
        prompts: translations.prompts.map((p) => interpolate(p, values)),
        sampleConversation: translations.sampleConversation.map((msg) => ({
            role: msg.role,
            content: interpolate(msg.content, values),
        })),
    };
}

/**
 * Get translations for a locale, with config values interpolated
 */
export function t(locale: Locale, configValues?: { coachName: string; domain: string }): Translations {
    const raw = rawTranslations[locale] || rawTranslations.en;

    // Default values if no config provided
    const values = configValues || {
        coachName: 'Coach',
        domain: '',
    };

    return interpolateTranslations(raw, values);
}

/**
 * Get raw translations without interpolation (for server-side or testing)
 */
export function getRawTranslations(locale: Locale): Translations {
    return rawTranslations[locale] || rawTranslations.en;
}

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['th', 'en', 'zh', 'ko', 'ja'];
