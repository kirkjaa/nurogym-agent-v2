import ChatbotRAG from '../components/ChatbotRAG';
import styles from '../styles/chatpage.module.css';

export default function ChatPage() {
  return (
    <div className={styles.container}>
      {/* This is the existing chatbot component from your project */}
      <ChatbotRAG />
    </div>
  );
} 