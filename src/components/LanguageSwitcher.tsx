import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../lib/i18n/LocaleContext';
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_SHORT, Locale } from '../lib/i18n/translations';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useLocale();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={styles.trigger}
                onClick={() => setOpen(!open)}
                aria-label="Change language"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className={styles.currentLang}>{LOCALE_SHORT[locale]}</span>
            </button>
            {open && (
                <div className={styles.dropdown}>
                    {SUPPORTED_LOCALES.map((loc: Locale) => (
                        <button
                            key={loc}
                            className={`${styles.option} ${loc === locale ? styles.active : ''}`}
                            onClick={() => {
                                setLocale(loc);
                                setOpen(false);
                            }}
                        >
                            {LOCALE_LABELS[loc]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
