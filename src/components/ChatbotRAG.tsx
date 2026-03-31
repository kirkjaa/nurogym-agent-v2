import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useChat } from "ai/react";
import { Message } from "ai";
import Bubble from './Bubble';
import LoadingBubble from './LoadingBubble';
import PromptSuggestionRow from './PromptSuggestionRow';
import CustomTextArea from './CustomTextArea';
import LanguageSwitcher from './LanguageSwitcher';
import { setChatMessages, appendChatMessage } from '../lib/redux/reducers';
import { RootState } from '../lib/redux/rootState';
import { useLocale } from '../lib/i18n/LocaleContext';
import styles from './ChatbotRAG.module.css';

interface ChatbotRAGProps {
    embedded?: boolean;
}

const ChatbotRAG: React.FC<ChatbotRAGProps> = ({ embedded = false }) => {
    const dispatch = useDispatch();
    const messagesFromRedux = useSelector((state: RootState) => state.chatMessages);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { append, isLoading, input, handleInputChange, handleSubmit, messages, setMessages } = useChat({
        onError: () => {
            setErrorMsg(translations.errorMessage ?? 'Something went wrong. Please try again.');
            setTimeout(() => setErrorMsg(null), 6000);
        },
    });
    const { translations } = useLocale();

    const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    
    const chatSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedMessages: Message[] = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        setMessages(storedMessages);
        dispatch(setChatMessages(storedMessages));
        setInitialMessagesLoaded(true);
    }, [dispatch, setMessages]);

    useEffect(() => {
        setMessages(messagesFromRedux);
    }, [messagesFromRedux, setMessages]);

    useEffect(() => {
        if (initialMessagesLoaded) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages, initialMessagesLoaded]);

    const handleScroll = () => {
        const chatSection = chatSectionRef.current;
        if (chatSection) {
            const isBottom = Math.abs(chatSection.scrollHeight - chatSection.scrollTop - chatSection.clientHeight) <= 1;
            setIsAtBottom(isBottom);
        }
    };

    useEffect(() => {
        const chatSection = chatSectionRef.current;
        if (chatSection) {
            chatSection.addEventListener('scroll', handleScroll);
            handleScroll();
        }

        return () => {
            if (chatSection) {
                chatSection.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const scrollToBottom = () => {
        if (chatSectionRef.current) {
            chatSectionRef.current.scrollTo({
                top: chatSectionRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const noMessages = !messages || messages.length === 0;

    const appendMessage = (msg: Message) => {
        dispatch(appendChatMessage(msg));
        append(msg);
        scrollToBottom();
    };

    const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(e);
        scrollToBottom();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            customHandleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handlePrompt = (promptText: string) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: 'user',
        };
        appendMessage(msg);
    };

    return (
        <main className={`${styles.chatbot} ${embedded ? styles.chatbotEmbedded : ''}`}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="4" />
                        <line x1="8" y1="16" x2="8" y2="16" />
                        <line x1="16" y1="16" x2="16" y2="16" />
                    </svg>
                    {translations.headerTitle}
                </h2>
                <LanguageSwitcher />
            </div>
            <section className={`${styles.section} ${noMessages ? styles.empty : styles.populated}`} ref={chatSectionRef}>
                {noMessages ? (
                    <>
                        <p className={styles.starterText}>{translations.starterText}</p>
                        <div className={styles.sampleConversation}>
                            <p className={styles.sampleLabel}>{translations.sampleLabel}</p>
                            {translations.sampleConversation.map((msg, i) => (
                                <Bubble
                                    key={`sample-${i}`}
                                    message={{ id: `sample-${i}`, role: msg.role, content: msg.content }}
                                />
                            ))}
                        </div>
                        <PromptSuggestionRow onPromptClick={handlePrompt} />
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <Bubble key={`message-${index}`} message={message} />
                        ))}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
            </section>
            {errorMsg && (
                <div className={styles.errorToast}>{errorMsg}</div>
            )}
            { !isAtBottom && (
                <button className={styles.scrollButton} onClick={scrollToBottom}>
                    ▼
                </button>
            )}
            <form className={styles.form} onSubmit={customHandleSubmit}>
                <div className={styles.inputContainer}>
                    <CustomTextArea
                        value={input}
                        onChange={handleInputChange}
                        placeholder={translations.placeholder}
                        onKeyPress={handleKeyPress}
                    />
                    <button type="submit" className={styles.submitButton}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className={styles.submitIcon}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9-9m0 0l9 9m-9-9v18" />
                        </svg>
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ChatbotRAG;
