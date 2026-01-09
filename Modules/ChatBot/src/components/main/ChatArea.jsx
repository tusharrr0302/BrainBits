import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Mic, ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useChatStore from "../../store/chatStore";
import Mascot from "./Mascot";
import styles from "./ChatArea.module.css";

const ChatArea = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close share menu when clicking outside
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

  const handleShareChat = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyChat = () => {
    const chatText = messages
      .map(
        (msg) => `${msg.role === "user" ? "You" : "BrainBits"}: ${msg.content}`
      )
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
      .map(
        (msg) => `${msg.role === "user" ? "You" : "BrainBits"}: ${msg.content}`
      )
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${currentChat?.title || "conversation"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowShareMenu(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = createNewChat();
      selectChat(activeChatId);
    }

    // Add user message
    addMessage({
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    });

    // Add placeholder assistant message
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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          chatId: activeChatId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

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

      // Update chat title if still "New Chat"
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.container}>
      {hasMessages && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.shareButtonContainer}
        >
          <button onClick={handleShareChat} className={styles.shareButton}>
            <Share2 size={16} />
            Share
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.shareMenu}
              >
                <button
                  onClick={handleCopyChat}
                  className={styles.shareMenuItem}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy to clipboard"}
                </button>
                <button
                  onClick={handleExportChat}
                  className={styles.shareMenuItem}
                >
                  <ArrowLeft
                    size={16}
                    style={{ transform: "rotate(180deg)" }}
                  />
                  Export as text file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <div className={styles.contentArea}>
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.emptyState}
            >
              <Mascot />
              <h2 className={styles.emptyTitle}>How can I help you today?</h2>
            </motion.div>
          ) : (
            <motion.div key="chat" className={styles.chatContainer}>
              {messages.map((message, index) => {
                const isAssistant = message.role === "assistant";
                const isLastAssistantMessage =
                  isAssistant && index === messages.length - 1;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`${styles.message} ${
                      isAssistant ? styles.assistantMessage : styles.userMessage
                    }`}
                  >
                    <div className={styles.messageContent}>
                      {isAssistant ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Headings
                            h1: ({ children }) => (
                              <h3 className={styles.markdownHeading}>{children}</h3>
                            ),
                            h2: ({ children }) => (
                              <h4 className={styles.markdownHeading}>{children}</h4>
                            ),
                            h3: ({ children }) => (
                              <h5 className={styles.markdownHeading}>{children}</h5>
                            ),

                            // Bold & strong
                            strong: ({ children }) => (
                              <strong className={styles.markdownBold}>{children}</strong>
                            ),

                            // Lists
                            ul: ({ children }) => (
                              <ul className={styles.markdownUl}>{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className={styles.markdownOl}>{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className={styles.markdownLi}>{children}</li>
                            ),

                            // Paragraphs
                            p: ({ children }) => (
                              <p className={styles.markdownP}>{children}</p>
                            ),

                            // Code
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
                          {message.content || (isLastAssistantMessage && isLoading ? "Typing..." : "")}
                        </ReactMarkdown>
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

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <button className={styles.iconButton}>
            <Plus />
          </button>

          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress} // changed to onKeyDown for better Enter handling
              disabled={isLoading}
              placeholder="Chat here..."
              className={styles.input}
            />

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className={styles.sendButton}
            >
              ➤
            </button>
          </div>

          <button className={styles.iconButton}>
            <Mic />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;