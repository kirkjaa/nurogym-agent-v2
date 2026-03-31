import { useLocale } from '../lib/i18n/LocaleContext';
import styles from './ChatbotRAG.module.css';

const LoadingBubble = () => {
    const { translations } = useLocale();

    return (
        <div className={styles.loader}>
            <div className={styles.loaderAvatar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
            </div>
            <div className={styles.loaderBubble}>
                {translations.loading}
                <span className={styles.loaderDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>
        </div>
    );
};

export default LoadingBubble;
