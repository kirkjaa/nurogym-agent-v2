/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Message } from 'ai';
import ReactMarkdown, { Components } from 'react-markdown';
import styles from './ChatbotRAG.module.css';

interface BubbleProps {
    message: Message;
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
const VIDEO_EXT_REGEX = /\.(mp4|webm|ogg)(\?.*)?$/i;

function extractYouTubeId(url: string): string | null {
    const match = url.match(YOUTUBE_REGEX);
    return match ? match[1] : null;
}

function isVideoUrl(url: string): boolean {
    return VIDEO_EXT_REGEX.test(url);
}

function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}

function stripThinking(text: string): string {
    const lines = text.split('\n');
    const cleanedLines: string[] = [];
    let inThinkingBlock = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (isThinkingLine(trimmed)) {
            inThinkingBlock = true;
            continue;
        }

        if (inThinkingBlock) {
            if (isActualContent(trimmed)) {
                inThinkingBlock = false;
                cleanedLines.push(line);
            }
            continue;
        }

        cleanedLines.push(line);
    }

    return cleanedLines.join('\n')
        .replace(/\(Mental check:[^)]*\)/gi, '')
        .replace(/\(Correction:[^)]*\)/gi, '')
        .replace(/\(thinking:[^)]*\)/gi, '')
        .replace(/\(Note to self:[^)]*\)/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function isThinkingLine(line: string): boolean {
    if (!line) return false;

    if (/^\*(?:Wait|Actually|Self-Correction|However|Alternative|Let's|Let me|Refined|Response Structure|Tone:|Language:|Frame \d|Insert|Crucial)/i.test(line)) return true;

    if (/^\*(?:As an AI|My current|I (?:will|should|need|can|don't|cannot))/i.test(line)) return true;

    if (/^\*.*(?:check|think|tool|capability|capabilities|generate|DALL-E|search tool|system prompt|developer prompt).*\*$/i.test(line)) return true;

    if (/^\((?:Mental|Thinking|Check|Self|Note|Actually|Wait|As an AI|My current|I should|I will|I need|Let me|Let's|Provide|Insert)/i.test(line)) return true;

    return false;
}

function isActualContent(line: string): boolean {
    if (!line) return false;

    if (/^(?:สวัสดี|เข้าใจ|ครับ|ดี|##|###|\*\*(?:เฟรม|ขั้นตอน|วิธี|เทคนิค|Frame|Step|Key|How|The))/i.test(line)) return true;

    if (/^(?:Hello|Hi|Welcome|Here|The |A |In |For |This |To |##|###|>|---|\|)/i.test(line)) return true;

    if (/^(?:你好|안녕|こんにちは)/i.test(line)) return true;

    if (/^\d+\.\s+\*\*/.test(line)) return true;

    if (/^[-*]\s+\*\*/.test(line)) return true;

    if (/^!\[/.test(line)) return true;
    if (/^\[.*\]\(http/.test(line)) return true;
    if (/^⚠️/.test(line)) return true;

    return false;
}

const markdownComponents: Components = {
    a({ href, children }) {
        if (!href) return <>{children}</>;

        const ytId = extractYouTubeId(href);
        if (ytId) {
            return (
                <div className={styles.videoEmbed}>
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.videoIframe}
                    />
                    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.videoSource}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        YouTube
                    </a>
                </div>
            );
        }

        if (isVideoUrl(href)) {
            return (
                <div className={styles.videoEmbed}>
                    <video controls className={styles.videoPlayer} preload="metadata">
                        <source src={href} />
                    </video>
                </div>
            );
        }

        if (isImageUrl(href) && typeof children === 'string' && children === href) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    <img src={href} alt="" className={styles.richImage} loading="lazy" />
                </a>
            );
        }

        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={styles.richLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {children}
            </a>
        );
    },

    img({ src, alt }) {
        if (!src) return null;

        const ytId = extractYouTubeId(src);
        if (ytId) {
            return (
                <div className={styles.videoEmbed}>
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                        title={alt || 'YouTube video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.videoIframe}
                    />
                </div>
            );
        }

        return (
            <a href={src} target="_blank" rel="noopener noreferrer">
                <img src={src} alt={alt || ''} className={styles.richImage} loading="lazy" />
            </a>
        );
    },
};

const Bubble: React.FC<BubbleProps> = ({ message }) => {
    const { content, role } = message;
    const isUser = role === 'user';

    return (
        <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}>
            {!isUser && (
                <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="4" />
                        <line x1="8" y1="16" x2="8" y2="16" />
                        <line x1="16" y1="16" x2="16" y2="16" />
                    </svg>
                </div>
            )}
            <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
                {isUser ? content : (
                    <ReactMarkdown components={markdownComponents}>
                        {stripThinking(content)}
                    </ReactMarkdown>
                )}
            </div>
            {isUser && (
                <div className={`${styles.avatar} ${styles.avatarUser}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default Bubble;
