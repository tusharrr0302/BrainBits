import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Mic, ArrowLeft, Share2, Copy, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useChatStore from "../api/chatStore";
import styles from "./ChatArea.module.css";
import Sidebar from "./Sidebar";

// Typing indicator sub-component
const TypingIndicator = () => (
  <div className={styles.typingIndicator}>
    <span className={styles.typingDot} />
    <span className={styles.typingDot} />
    <span className={styles.typingDot} />
  </div>
);

// Suggestion chips for empty state
const SUGGESTIONS = [
  "Explain time complexity",
  "Review my code",
  "Help with LeetCode",
  "Study plan for DSA",
  "What is dynamic programming?",
  "Explain Big O notation",
];

const ChatBotChatArea = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    currentChatId,
    chats,
    createNewChat,
    selectChat,
    addMessage,
    updateLastMessage,
    updateChatTitle,
  } = useChatStore();

  const currentChat = useMemo(
    () => chats.find((chat) => chat.id === currentChatId) || null,
    [chats, currentChatId]
  );

  const messages = currentChat?.messages || [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close share menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showShareMenu &&
        !e.target.closest(`.${styles.shareButton}`) &&
        !e.target.closest(`.${styles.shareMenu}`)
      ) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  const handleShareChat = () => setShowShareMenu(!showShareMenu);

  const handleCopyChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role === "user" ? "You" : "BrainBits"}: ${msg.content}`)
      .join("\n\n");

    navigator.clipboard.writeText(chatText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    });
  };

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role === "user" ? "You" : "BrainBits"}: ${msg.content}`)
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${currentChat?.title || "conversation"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowShareMenu(false);
  };

  const handleSendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput("");
    setIsLoading(true);
    setError(null);

    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = createNewChat();
      selectChat(activeChatId);
    }

    addMessage({
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    });

    addMessage({
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    });

    try {
      const state = useChatStore.getState();
      const chat = state.chats.find((c) => c.id === activeChatId);
      const payloadMessages = (chat?.messages || []).filter(
        (m) => m.content && m.content.trim()
      );

      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages, chatId: activeChatId }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to fetch response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = line.replace("data:", "").trim();
          if (!json) continue;
          const parsed = JSON.parse(json);
          if (parsed.content) {
            fullResponse += parsed.content;
            updateLastMessage(fullResponse);
          }
          if (parsed.done) break;
        }
      }

      const updatedChat = chats.find((c) => c.id === activeChatId);
      if (updatedChat && updatedChat.title === "New Chat") {
        updateChatTitle(activeChatId, messageText.slice(0, 50));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      updateLastMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      <Sidebar open={open} setOpen={setOpen} />

      <div
        className={`${styles.container} ${open ? "ml-64" : "ml-20"} transition-all`}
      >
        {/* ── Top Bar ── */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarBreadcrumb}>
              Home Page / <span>Chatbot</span>
            </span>
          </div>

          {hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.shareButtonContainer}
            >
              <button onClick={handleShareChat} className={styles.shareButton}>
                <Share2 size={13} />
                Share
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className={styles.shareMenu}
                  >
                    <button onClick={handleCopyChat} className={styles.shareMenuItem}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy to clipboard"}
                    </button>
                    <button onClick={handleExportChat} className={styles.shareMenuItem}>
                      <ArrowLeft size={13} style={{ transform: "rotate(180deg)" }} />
                      Export as markdown
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              /* Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className={styles.emptyState}
              >
                <div className={styles.emptyIconWrap}>
                  <Zap size={28} color="#20a0c0" strokeWidth={1.5} />
                </div>
                <h2 className={styles.emptyTitle}>How can I help you today?</h2>
                {/* <p className={styles.emptySubtitle}>
                  ASK ME ANYTHING · POWERED BY BRAINBITS AI
                </p> */}
                <div className={styles.emptySuggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className={styles.suggestionChip}
                      onClick={() => handleSendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Chat Messages */
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.chatContainer}
              >
                {messages.map((message, index) => {
                  const isAssistant = message.role === "assistant";
                  const isLastMessage = index === messages.length - 1;
                  const showTyping =
                    isAssistant && isLastMessage && isLoading && !message.content;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: index < 4 ? 0.04 * index : 0 }}
                      className={`${styles.message} ${
                        isAssistant ? styles.assistantMessage : styles.userMessage
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`${styles.messageAvatar} ${
                          isAssistant ? styles.assistantAvatar : styles.userAvatar
                        }`}
                      >
                        {isAssistant ? "BB" : "U"}
                      </div>

                      {/* Bubble */}
                      <div className={styles.messageContent}>
                        {isAssistant ? (
                          showTyping ? (
                            <TypingIndicator />
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h3 className={styles.markdownHeading}>{children}</h3>
                                ),
                                h2: ({ children }) => (
                                  <h4 className={styles.markdownHeading}>{children}</h4>
                                ),
                                h3: ({ children }) => (
                                  <h5 className={styles.markdownHeading}>{children}</h5>
                                ),
                                strong: ({ children }) => (
                                  <strong className={styles.markdownBold}>{children}</strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className={styles.markdownUl}>{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className={styles.markdownOl}>{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className={styles.markdownLi}>{children}</li>
                                ),
                                p: ({ children }) => (
                                  <p className={styles.markdownP}>{children}</p>
                                ),
                                code: ({ inline, children }) =>
                                  inline ? (
                                    <code className={styles.markdownInlineCode}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className={styles.markdownCodeBlock}>
                                      <code>{children}</code>
                                    </pre>
                                  ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )
                        ) : (
                          <p className={styles.userMessageText}>{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className={styles.errorMessage}>
            <div className={styles.errorInner}>⚠ {error}</div>
          </div>
        )}

        {/* ── Input Area ── */}
        <div className={styles.inputArea}>
          <div className={styles.inputAreaInner}>
            <div className={styles.inputWrapper}>
              <button className={styles.iconButton} title="Attach">
                <Plus size={16} />
              </button>

              <div className={styles.inputContainer}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Chat here..."
                  className={styles.input}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className={styles.sendButton}
                  title="Send"
                >
                  ➤
                </button>
              </div>

              <button className={styles.iconButton} title="Voice input">
                <Mic size={16} />
              </button>
            </div>

            <p className={styles.inputHint}>
              ENTER to send · SHIFT+ENTER for new line · BRAINBITS AI
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBotChatArea;