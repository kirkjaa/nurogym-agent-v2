import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, DEFAULT_LOCALE, t, SUPPORTED_LOCALES } from './translations';

// Default config values - these can be overridden via CoachConfigProvider
const DEFAULT_COACH_NAME = 'Coach';
const DEFAULT_DOMAIN = '';
const DEFAULT_STORAGE_KEY_PREFIX = 'coach-agent';

interface CoachConfigContextType {
    coachName: string;
    domain: string;
    storageKeyPrefix: string;
}

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    translations: ReturnType<typeof t>;
    coachConfig: CoachConfigContextType;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: DEFAULT_LOCALE,
    setLocale: () => {},
    translations: t(DEFAULT_LOCALE, { coachName: DEFAULT_COACH_NAME, domain: DEFAULT_DOMAIN }),
    coachConfig: {
        coachName: DEFAULT_COACH_NAME,
        domain: DEFAULT_DOMAIN,
        storageKeyPrefix: DEFAULT_STORAGE_KEY_PREFIX,
    },
});

export const useLocale = () => useContext(LocaleContext);

interface LocaleProviderProps {
    children: React.ReactNode;
    coachName?: string;
    domain?: string;
    storageKeyPrefix?: string;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
    children,
    coachName = DEFAULT_COACH_NAME,
    domain = DEFAULT_DOMAIN,
    storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
}) => {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
    const storageKey = `${storageKeyPrefix}-locale`;

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Locale | null;
        if (stored && SUPPORTED_LOCALES.includes(stored)) {
            setLocaleState(stored);
        }
    }, [storageKey]);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(storageKey, newLocale);
    }, [storageKey]);

    const translations = t(locale, { coachName, domain });

    const coachConfig: CoachConfigContextType = {
        coachName,
        domain,
        storageKeyPrefix,
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, translations, coachConfig }}>
            {children}
        </LocaleContext.Provider>
    );
};
