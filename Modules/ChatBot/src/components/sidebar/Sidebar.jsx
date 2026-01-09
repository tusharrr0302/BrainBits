import React, { useMemo } from "react";
import { Search, SquarePen, ArrowUpRight } from "lucide-react";
import useChatStore from "../../store/chatStore";
import { motion } from "framer-motion";
import styles from "./Sidebar.module.css";
import logo from "../../assets/Logo.png";

const Sidebar = () => {
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

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatSelect = (chatId) => {
    selectChat(chatId);
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={styles.sidebar}
    >
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="BrainBits Logo" className={styles.logoIcon} />
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className={styles.newChatSection}>
        <button onClick={handleNewChat} className={styles.newChatButton}>
          <SquarePen />
          <span>New Chat</span>
        </button>
      </div>

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
                onClick={() => handleChatSelect(chat.id)}
                className={`${styles.chatItem} ${
                  currentChatId === chat.id
                    ? styles.chatItemActive
                    : styles.chatItemInactive
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUpRight />
                <span className={styles.chatItemText}>{chat.title}</span>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
