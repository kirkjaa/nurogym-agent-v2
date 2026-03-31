import Link from 'next/link';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLocale } from '../lib/i18n/LocaleContext';
import styles from '../styles/home.module.css';

export default function HomePage() {
  const { translations, coachConfig } = useLocale();

  return (
    <main className={styles.container}>
      <div className={styles.langSwitcher}>
        <LanguageSwitcher />
      </div>
      <div className={styles.mainContent}>
        <p className={styles.welcomeText}>{translations.welcomeText}</p>

        <h1 className={styles.title}>{coachConfig.coachName}</h1>
        <h2 className={styles.logoSubtext}>{translations.subtitle}</h2>

        <hr className={styles.divider} />

        <p className={styles.promptText}>{translations.startPrompt}</p>

        <Link href="/chat" passHref>
          <button className={styles.actionButton}>{translations.startButton}</button>
        </Link>
      </div>
    </main>
  );
}
