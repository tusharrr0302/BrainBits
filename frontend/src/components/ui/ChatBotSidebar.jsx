import { useMemo } from "react";
import { Search, SquarePen, ArrowUpRight } from "lucide-react";
import useChatStore from "../api/chatStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

const ChatBotSidebar = () => {
  const {
    chats,
    currentChatId,
    searchQuery,
    setSearchQuery,
    createNewChat,
    selectChat,
  } = useChatStore();

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={styles.sidebar}
    >
      {/* Logo */}
      <div className={styles.logoSection}>
        <Link to="/dashboard" className={styles.logoContainer}>
          <img src="/logo.png" alt="BrainBits" className={styles.logoIcon} />
        </Link>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* New Chat */}
      <div className={styles.newChatSection}>
        <button onClick={createNewChat} className={styles.newChatButton}>
          <SquarePen />
          <span>New Chat</span>
        </button>
      </div>

      <div className={styles.divider} />

      {/* Chat History */}
      <div className={styles.chatHistorySection}>
        <h2 className={styles.chatHistoryTitle}>Chat History</h2>

        <div className={styles.chatList}>
          {filteredChats.length === 0 ? (
            <p className={styles.emptyState}>No chats yet</p>
          ) : (
            filteredChats.map((chat) => (
              <motion.button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`${styles.chatItem} ${
                  currentChatId === chat.id
                    ? styles.chatItemActive
                    : styles.chatItemInactive
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <ArrowUpRight />
                <span className={styles.chatItemText}>{chat.title}</span>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        {/* <p className={styles.footerPowered}>POWERED BY BRAINBITS AI</p> */}
      </div>
    </motion.div>
  );
};

export default ChatBotSidebar;