import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      // Chat sessions
      chats: [],
      currentChatId: null,
      searchQuery: '',

      // Create a new chat
      createNewChat: () => {
        const newChat = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));
        return newChat.id;
      },

      // Select a chat
      selectChat: (chatId) => {
        set({ currentChatId: chatId });
      },

      // Add message to current chat
      addMessage: (message) => {
        const { currentChatId, chats } = get();
        if (!currentChatId) {
          const newChatId = get().createNewChat();
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === newChatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            ),
          }));
        } else {
          set({
            chats: chats.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            ),
          });
        }
      },

      // Update last message (for streaming)
      updateLastMessage: (content) => {
        const { currentChatId, chats } = get();
        if (!currentChatId) return;

        set({
          chats: chats.map((chat) => {
            if (chat.id === currentChatId) {
              const messages = [...chat.messages];
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.role === 'assistant') {
                  messages[messages.length - 1] = {
                    ...lastMessage,
                    content: content,
                  };
                }
              }
              return { ...chat, messages };
            }
            return chat;
          }),
        });
      },

      // Update chat title
      updateChatTitle: (chatId, title) => {
        set({
          chats: get().chats.map((chat) =>
            chat.id === chatId ? { ...chat, title } : chat
          ),
        });
      },

      // Delete chat
      deleteChat: (chatId) => {
        const { chats, currentChatId } = get();
        const filtered = chats.filter((chat) => chat.id !== chatId);
        set({
          chats: filtered,
          currentChatId:
            currentChatId === chatId
              ? filtered.length > 0
                ? filtered[0].id
                : null
              : currentChatId,
        });
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'brainbits-chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChatStore;
