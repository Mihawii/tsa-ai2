"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

// Dynamically import components that might cause SSR issues
const DynamicNavigation = dynamic(() => import('@/components/Navigation'), {
  ssr: false,
  loading: () => <div className="h-16" /> // Placeholder while loading
});

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  timestamp?: number;
  reasoning?: string;
  isThinking?: boolean;
}

// Conversation type
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const SUGGESTIONS = [
  "What's trending in AI?",
  "How do I raise funding?",
  "Show me startup metrics",
  "Give me a business idea",
  "How to scale my product?",
  "What are top VC funds?"
];

function formatAIMessage(content: string) {
  const paragraphs = content.split(/\n\n|(?<=[.!?])\s+(?=[A-Z])/g);
  return paragraphs.map((para, idx) => (
    <p key={idx} className="mb-3 whitespace-pre-line">{para.trim()}</p>
  ));
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-black/90 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper to generate a new conversation object
function createNewConversation(initialMessage: ChatMessage): Conversation {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: initialMessage.content.slice(0, 32) || 'New Chat',
    messages: [initialMessage],
    createdAt: Date.now(),
  };
}

// At the top of ChatPage, get the user's email from localStorage
const userEmail = typeof window !== 'undefined' ? localStorage.getItem('ai_student_email') : null;

// Add AnimatedAIMessage component for word-by-word animation
function AnimatedAIMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!content) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(content.slice(0, i + 1));
      i++;
      if (i >= content.length) clearInterval(interval);
    }, 16); // ~60 chars/sec
    return () => clearInterval(interval);
  }, [content]);
  return <span>{displayed}</span>;
}

// --- Remade Typing Panel and AI Message Animation ---
import { useState } from 'react';

function WordByWordAIMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const words = content.split(/(\s+)/);
  useEffect(() => {
    setDisplayed([]);
    if (!content) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(words.slice(0, i + 1));
      i++;
      if (i >= words.length) clearInterval(interval);
    }, 80); // ~12 words/sec
    return () => clearInterval(interval);
  }, [content]);
  return <span>{displayed.join('')}</span>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ensure client-side only code
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format message content
  const formatMessage = (content: string) => {
    const sections = content.split(/(?=#{1,6}\s)/);
    return sections.map((section, index) => {
      const headerMatch = section.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        return (
          <div key={index} className={`mb-2 ${level === 1 ? 'text-xl font-bold' : level === 2 ? 'text-lg font-semibold' : 'text-base font-medium'}`}>
            {text}
          </div>
        );
      }
      return (
        <div key={index} className="mb-2">
          {section}
        </div>
      );
    });
  };

  // Instant send suggestion
  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (isLoading) return;
    setInput('');
    // Add user message
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: suggestion, 
      type: 'text',
      timestamp: Date.now()
    }]);
    // Add thinking message
    setMessages(prev => [...prev, {
      role: 'ai',
      content: '',
      type: 'text',
      timestamp: Date.now(),
      isThinking: true
    }]);
    setIsLoading(true);
    try {
      // First, get business intelligence context
      const businessResponse = await fetch('/api/business-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: suggestion,
          context: messages
        }),
      });
      const businessData = await businessResponse.json();
      if (!businessResponse.ok) {
        throw new Error(businessData.error || 'Failed to get business intelligence');
      }
      // Then, get the AI response with enhanced context
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: suggestion,
          format: 'structured',
          businessContext: businessData.context
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      // Remove thinking message and add AI response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isThinking);
        return [...newMessages, { 
          role: 'ai', 
          content: data.message,
          reasoning: data.reasoning,
          type: 'text',
          timestamp: Date.now()
        }];
      });
    } catch (error) {
      // Remove thinking message and add error message
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isThinking);
        return [...newMessages, { 
          role: 'ai', 
          content: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}. Please try again or contact support if the issue persists.`,
          type: 'text',
          timestamp: Date.now()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  // Send message (with adaptive context, but focused reasoning)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      type: 'text',
      timestamp: Date.now()
    }]);

    // Add thinking message
    setMessages(prev => [...prev, {
      role: 'ai',
      content: '',
      type: 'text',
      timestamp: Date.now(),
      isThinking: true
    }]);

    setIsLoading(true);
    try {
      // Get business intelligence context (all previous messages)
      const businessResponse = await fetch('/api/business-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          context: messages // pass full conversation
        }),
      });
      const businessData = await businessResponse.json();
      if (!businessResponse.ok) {
        throw new Error(businessData.error || 'Failed to get business intelligence');
      }
      // Get the AI response, focused on the latest question, but with full context
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage, // only answer this
          format: 'structured',
          businessContext: businessData.context,
          conversation: messages // pass full conversation for adaptive context
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      // Remove thinking message and add AI response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isThinking);
        return [...newMessages, {
          role: 'ai',
          content: data.message,
          reasoning: data.reasoning,
          type: 'text',
          timestamp: Date.now()
        }];
      });
    } catch (error) {
      // Remove thinking message and add error message
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isThinking);
        return [...newMessages, {
          role: 'ai',
          content: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}. Please try again or contact support if the issue persists.`,
          type: 'text',
          timestamp: Date.now()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update saveConversations and load logic to use userEmail as the key
  const saveConversations = (convs: Conversation[]) => {
    if (userEmail) {
      localStorage.setItem(`ai_conversations_${userEmail}`, JSON.stringify(convs.slice(-50)));
    }
  };

  // Load conversations from localStorage
  useEffect(() => {
    if (!isMounted || !userEmail) return;
    const stored = localStorage.getItem(`ai_conversations_${userEmail}`);
    if (stored) {
      setConversations(JSON.parse(stored));
    }
  }, [isMounted, userEmail]);

  // Track if user has started a conversation
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'user') {
      setHasStarted(true);
    }
  }, [messages]);

  // On first user message, set hasStarted to true
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'user') {
      // New conversation
      const newConv = createNewConversation(messages[0]);
      setConversations(prev => {
        const updated = [...prev, newConv].slice(-50);
        saveConversations(updated);
        return updated;
      });
      setActiveConversationId(newConv.id);
    } else if (activeConversationId) {
      // Update existing conversation
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === activeConversationId ? { ...conv, messages } : conv
        );
        saveConversations(updated);
        return updated;
      });
    }
  }, [messages, isMounted]);

  // Handle new chat button
  const handleNewChat = () => {
    const newConv = createNewConversation({
      role: 'user',
      content: '',
      type: 'text',
      timestamp: Date.now(),
    });
    setConversations(prev => {
      const updated = [...prev, newConv].slice(-50);
      saveConversations(updated);
      return updated;
    });
    setActiveConversationId(newConv.id);
    setMessages([]);
    setHasStarted(false);
  };

  // When switching conversations, always update messages and activeConversationId
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversationId(conv.id);
    setMessages(conv.messages);
    setHasStarted(conv.messages.length > 0 && conv.messages[0].role === 'user');
  };

  // Save conversations robustly on every update
  useEffect(() => {
    if (!isMounted) return;
    if (activeConversationId) {
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === activeConversationId ? { ...conv, messages } : conv
        );
        saveConversations(updated);
        return updated;
      });
    }
  }, [messages, isMounted, activeConversationId]);

  // On first user message, call the AI backend to generate a title and save it
  useEffect(() => {
    if (!isMounted) return;
    if (messages.length === 1 && messages[0].role === 'user') {
      const userMsg = messages[0].content;
      (async () => {
        let title = '';
        try {
          const res = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Generate a short, relevant, human-like chat title (max 6 words, no punctuation, no quotes) for: ${userMsg}`,
              format: 'title',
              businessContext: '',
              conversation: []
            })
          });
          const data = await res.json();
          if (data && data.message) title = data.message.trim();
        } catch {}
        if (!title) {
          // Fallback: use first 8 words of user message
          title = userMsg.split(' ').slice(0, 8).join(' ');
        }
        const newConv = createNewConversation(messages[0]);
        newConv.title = title;
        setConversations(prev => {
          const updated = [...prev, newConv].slice(-50);
          saveConversations(updated);
          return updated;
        });
        setActiveConversationId(newConv.id);
      })();
    }
  }, [messages, isMounted]);

  // Delete chat handler
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== id);
      saveConversations(updated);
      // If the deleted chat was active, clear chat area or switch to another
      if (activeConversationId === id) {
        setActiveConversationId(updated.length > 0 ? updated[0].id : null);
        setMessages(updated.length > 0 ? updated[0].messages : []);
      }
      return updated;
    });
  };

  // Add TypingIndicator component
  function TypingIndicator() {
    return (
      <div className="ai-typing-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <style jsx>{`
          .ai-typing-indicator {
            display: flex;
            align-items: center;
            gap: 0.2em;
            margin: 0.5em 0 0.5em 0.5em;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #e93e1e;
            animation: bounce 1.2s infinite both;
          }
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.7; }
            40% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black/90">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex bg-black/90 relative overflow-hidden">
        {/* Dashboard Drawer (hidden by default, slides in from left) */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-black/40 border-r border-white/10 flex flex-col p-4 z-40 transition-transform duration-300 ease-in-out backdrop-blur-lg ${dashboardOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ boxShadow: dashboardOpen ? '8px 0 32px 0 #0008' : 'none' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Conversations</h2>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setDashboardOpen(false)}
              title="Close"
            >
              ×
            </motion.button>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
            {conversations.length === 0 && (
              <div className="text-white/40 text-sm italic">No conversations yet.</div>
            )}
            <AnimatePresence>
              {conversations.map((conv: Conversation) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-full font-medium truncate glass-btn transition shadow border border-white/10 backdrop-blur-md',
                    conv.id === activeConversationId
                      ? 'bg-gradient-to-r from-[#e93e1e]/60 to-white/10 text-white shadow-lg'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                  onClick={() => handleSelectConversation(conv)}
                  style={{ position: 'relative', width: '100%' }}
                >
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 600 }}>{conv.title || 'New Chat'}</span>
                  <button
                    className="delete-chat-btn"
                    onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                    title="Delete chat"
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <FiTrash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition" />
                  </button>
                </motion.button>
              ))}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="new-chat-btn-minimal"
              onClick={handleNewChat}
            >
              <FiPlus style={{ fontSize: '1.1em' }} />
              <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 600, fontSize: '1.05em' }}>New Chat</span>
            </motion.button>
          </nav>
        </div>
        {/* Dashboard open button (top left) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          className="fixed top-6 left-6 z-50 rounded-full p-3 bg-white/10 hover:bg-white/20 text-white shadow-lg backdrop-blur-md"
          onClick={() => setDashboardOpen(true)}
          style={{ display: dashboardOpen ? 'none' : 'block' }}
          title="Open Dashboard"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/></svg>
        </motion.button>
        {/* Main chat area: open, immersive, no box */}
        <div className="flex-1 flex flex-col items-center justify-end h-full relative z-10">
          <div className="flex flex-col items-center w-full flex-1 justify-end px-0 md:px-8" style={{ maxWidth: '100vw', margin: '0 auto' }}>
            <h1 className="text-3xl font-bold text-white mb-8 mt-8">TSa</h1>
            {/* Chat messages area: open, no container, just glass bubbles */}
            <div
              ref={chatContainerRef}
              className="chat-scrollable flex-1 w-full max-w-3xl mx-auto px-2 md:px-8 py-4 flex flex-col gap-4"
              style={{ minHeight: '40vh', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', height: '100%' }}
            >
              {!hasStarted && (
                <div className="w-full flex justify-center mt-16 animate-bounce-in">
                  <div className="text-center max-w-xl mx-auto text-lg md:text-2xl text-white/90 font-serif font-bold" style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 600 }}>
                    <div className="mb-2 text-2xl">Welcome to TSa!</div>
                    <div className="text-base md:text-lg text-white/70 font-normal">Ask me anything about startups, business, or AI. Your conversations will be saved here for you to revisit anytime.</div>
                  </div>
                </div>
              )}
              {messages.map((message, index) => {
                const isUser = message.role === 'user';
                const isLatestAI =
                  !isUser &&
                  index === messages.length - 1 &&
                  isLoading &&
                  !message.isThinking;
                return (
                  <div
                    key={index}
                    className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-2 items-end`}
                    style={{ alignItems: 'flex-end' }}
                  >
                    {/* AI Avatar */}
                    {!isUser && (
                      <div className="flex mr-2 self-end" style={{ alignSelf: 'flex-end' }}>
                        <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center">
                          <span className="font-bold text-gray-500 text-xs">AI</span>
                        </div>
                      </div>
                    )}
                    {/* Plain message text */}
                    {isUser ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="plain-message-text"
                        style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.08rem', color: '#fff', fontWeight: 500, maxWidth: '70%' }}
                      >
                        {message.isThinking ? (
                          <span className="reasoning-animated-strong">Reasoning</span>
                        ) : (
                          <>
                            {message.type === 'image' && message.imageUrl && (
                              <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                            )}
                            {formatMessage(message.content)}
                            {message.reasoning && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-2 pt-2 text-xs text-gray-400"
                              >
                                <details>
                                  <summary className="cursor-pointer hover:text-white/80">View reasoning</summary>
                                  <div className="mt-2 whitespace-pre-line">{message.reasoning}</div>
                                </details>
                              </motion.div>
                            )}
                            <div className="glass-timestamp" style={{ color: '#888', textAlign: 'right', fontSize: '0.7rem', marginTop: '0.2em' }}>
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="plain-message-text"
                        style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.08rem', color: '#b0b3bb', fontWeight: 500, maxWidth: '70%' }}
                      >
                        {message.isThinking ? (
                          <span className="reasoning-animated-strong">Reasoning</span>
                        ) : isLatestAI ? (
                          <WordByWordAIMessage content={message.content} />
                        ) : (
                          <>
                            {message.type === 'image' && message.imageUrl && (
                              <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                            )}
                            {formatAIMessage(message.content)}
                            {message.reasoning && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-2 pt-2 text-xs text-gray-400"
                              >
                                <details>
                                  <summary className="cursor-pointer hover:text-white/80">View reasoning</summary>
                                  <div className="mt-2 whitespace-pre-line">{message.reasoning}</div>
                                </details>
                              </motion.div>
                            )}
                            <div className="glass-timestamp" style={{ color: '#888', textAlign: 'right', fontSize: '0.7rem', marginTop: '0.2em' }}>
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="w-full flex justify-start my-2 items-end">
                  <TypingIndicator />
                </div>
              )}
            </div>
          </div>
          {/* Suggestions row: fade out after first user message */}
          <AnimatePresence>
            {!hasStarted && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center mb-4"
              >
                <div className="flex flex-wrap gap-3 max-w-3xl mx-auto px-2">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.35, delay: idx * 0.07 }}
                      className="px-0 md:px-2 py-1 text-base md:text-lg font-serif font-semibold text-white/90 bg-transparent shadow-none border-none outline-none transition relative hover:text-white focus:text-white"
                      style={{
                        background: 'none',
                        fontFamily: 'DM Serif Display, serif',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                    >
                      <span className="inline-block fancy-gradient-text relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#e93e1e] after:to-orange-400 after:opacity-0 hover:after:opacity-100 after:transition-all after:duration-300">
                        {suggestion}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Input bar: glassy, floating, visually consistent with bubbles */}
          <div className="w-full flex justify-center mb-20">
            <div className="w-full max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="frosted-chat-input-remake">
                <label htmlFor="image-upload" className="frosted-icon-btn-remake" title="Attach image">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M7 14l3-3 2 2 3-3"/></svg>
                  <input
                    id="image-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="frosted-input-remake"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="frosted-icon-btn-remake"
                  title="Send"
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
              {selectedImage && (
                <div className="frosted-image-preview-remake">
                  <img src={selectedImage} alt="Preview" />
                  <button className="frosted-remove-image-remake" onClick={() => setSelectedImage(null)} title="Remove image">✕</button>
                </div>
              )}
            </div>
          </div>
          <DynamicNavigation onHomeClick={() => router.push('/')} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* Add this CSS to your global styles or in a <style jsx global> block if using CSS-in-JS:

.glassy-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.15);
  border-top: 4px solid #e93e1e;
  border-right: 4px solid orange;
  background: rgba(255,255,255,0.08);
  box-shadow: 0 4px 32px 0 #e93e1e33, 0 1.5px 8px 0 #fff2;
  animation: glassy-spin 1s linear infinite;
  backdrop-filter: blur(6px);
}

@keyframes glassy-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

<style jsx>{`
  .frosted-chat-input-remake {
    display: flex;
    align-items: center;
    gap: 1em;
    background: rgba(255,255,255,0.22);
    border-radius: 2.7em;
    box-shadow: 0 12px 40px 0 rgba(31,38,135,0.18);
    border: 1.5px solid rgba(255,255,255,0.28);
    backdrop-filter: blur(22px) saturate(180%);
    -webkit-backdrop-filter: blur(22px) saturate(180%);
    padding: 1em 1.7em;
    margin: 0.7em 0;
    position: relative;
  }
  .frosted-input-remake {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-size: 1.22rem;
    padding: 0.9em 1.2em;
    border-radius: 2.2em;
    font-family: 'DM Serif Display', serif;
    letter-spacing: 0.01em;
    transition: background 0.2s;
  }
  .frosted-input-remake::placeholder {
    color: #fff9;
    font-weight: 400;
    opacity: 0.7;
  }
  .frosted-icon-btn-remake {
    background: rgba(255,255,255,0.16);
    border: none;
    border-radius: 50%;
    width: 2.8em;
    height: 2.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e93e1e;
    font-size: 1.4rem;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    box-shadow: 0 2px 8px 0 rgba(233,62,30,0.08);
    margin: 0 0.1em;
  }
  .frosted-icon-btn-remake:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .frosted-icon-btn-remake:hover, .frosted-icon-btn-remake:focus {
    background: rgba(233,62,30,0.16);
    color: #fff;
    box-shadow: 0 4px 16px 0 rgba(233,62,30,0.13);
  }
  .frosted-image-preview-remake {
    display: flex;
    align-items: center;
    gap: 0.7em;
    margin-top: 0.7em;
    background: rgba(255,255,255,0.16);
    border-radius: 1.2em;
    padding: 0.5em 1em;
    box-shadow: 0 2px 8px 0 rgba(233,62,30,0.08);
    border: 1.5px solid #e93e1e33;
    max-width: 240px;
  }
  .frosted-image-preview-remake img {
    max-width: 100px;
    max-height: 70px;
    border-radius: 0.7em;
    border: 1.5px solid #e93e1e;
    box-shadow: 0 2px 8px 0 rgba(233,62,30,0.10);
  }
  .frosted-remove-image-remake {
    background: #e93e1e;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.4em;
    transition: background 0.18s;
  }
  .frosted-remove-image-remake:hover, .frosted-remove-image-remake:focus {
    background: #ff6b4a;
  }
`}</style> 