import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { sounds } from '../utils/sound';
import { MessageSquare, Send, X, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['🔥', '😂', '👏', '🏆', '😱', '⚡', '🕹️', '❤️'];

export const ChatDrawer: React.FC = () => {
  const { chatMessages, sendChatMessage, myPlayer } = useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (chatMessages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [chatMessages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  const handleSendEmoji = (emoji: string) => {
    sounds.playPop();
    sendChatMessage(emoji);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">Room Chat</span>
        {unreadCount > 0 && !isOpen && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-black animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Flyout Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[460px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-sm">Room Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reactions Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto gap-1">
              {QUICK_EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => handleSendEmoji(em)}
                  className="hover:scale-125 transition-transform text-lg p-1"
                  title={`Send ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Smile className="w-8 h-8 mb-2 opacity-40" />
                  <span>No messages yet. Say hello or send an emoji!</span>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.senderId === myPlayer?.socketId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span>{msg.avatar}</span>
                        <span className="font-bold">{msg.senderName}</span>
                      </div>
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] break-words ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-2">
              <input
                type="text"
                maxLength={100}
                placeholder="Type a quick message..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
