import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="space-y-6 py-6">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.timestamp}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-[#4a90e2] to-[#6c5ce7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[#4a90e2] text-white'
                  : 'bg-[#16213e] border border-[#2a2a3e] text-gray-300'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="text-sm whitespace-pre-wrap">
                  {message.content || (isLoading && index === messages.length - 1 ? <TypingIndicator /> : '')}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-[#2a2a3e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 justify-start"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#4a90e2] to-[#6c5ce7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-[#16213e] border border-[#2a2a3e] rounded-2xl px-4 py-3">
            <TypingIndicator />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessageList;
