import React from 'react';
import PromptSuggestionButton from './PromptSuggestionButton';
import { useLocale } from '../lib/i18n/LocaleContext';
import styles from './ChatbotRAG.module.css';

interface PromptSuggestionRowProps {
    onPromptClick: (prompt: string) => void;
}

const PromptSuggestionRow: React.FC<PromptSuggestionRowProps> = ({ onPromptClick }) => {
    const { translations } = useLocale();

    return (
        <div className={styles.promptSuggestionRow}>
            {translations.prompts.map((prompt, index) => (
                <PromptSuggestionButton 
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />
            ))}
        </div>
    );
};

export default PromptSuggestionRow;
