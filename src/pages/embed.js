import ChatbotRAG from '../components/ChatbotRAG';
import styles from '../styles/embed.module.css';

export default function EmbedPage() {
    return (
        <div className={styles.container}>
            <ChatbotRAG embedded={true} />
        </div>
    );
}
