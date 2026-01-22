import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat({ projectData, onClose }) {
  const [messages, setMessages] = useState([
    {
      text: `Hi! I'm your AI assistant. I've analyzed ${projectData.name}. Ask me anything about the code!`,
      isAI: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    "Where is the Navbar component?",
    "How do I run this project?",
    "What does App.jsx do?",
    "Explain the folder structure"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = {
      text: input,
      isAI: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(input.toLowerCase());
      setMessages(prev => [...prev, {
        text: aiResponse,
        isAI: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query) => {
    if (query.includes('navbar')) {
      return "The Navbar component is located at `src/components/Navbar.jsx`. It handles the main navigation with logo, menu items, and cart icon.";
    }
    if (query.includes('run') || query.includes('start')) {
      return `To run this project:\n1. npm install\n2. npm start\n3. Open http://localhost:3000`;
    }
    if (query.includes('app.jsx')) {
      return "App.jsx is the main component that renders all other components. It's the entry point of your React application.";
    }
    if (query.includes('folder') || query.includes('structure')) {
      return "The project has a standard React structure:\n- `src/` contains all source code\n- `public/` has static files\n- `components/` folder has all React components";
    }
    if (query.includes('tech stack') || query.includes('technologies')) {
      return `This project uses: ${projectData.techStack.join(', ')}. All modern and production-ready technologies!`;
    }
    return "I can help you understand the code! Try asking about specific components, how to run the project, or the tech stack used.";
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="chat-panel"
    >
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div className="chat-info">
          <h3>AI Assistant</h3>
          <span className="online">● Online</span>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`message ${msg.isAI ? 'ai' : 'user'}`}
          >
            {msg.isAI && <span className="msg-avatar">🤖</span>}
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
            {!msg.isAI && <span className="msg-avatar">👤</span>}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="message ai"
          >
            <span className="msg-avatar">🤖</span>
            <div className="message-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="quick-questions">
          <p>Try asking:</p>
          {quickQuestions.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="quick-btn"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about the code..."
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="send-btn"
          onClick={handleSend}
        >
          ➤
        </motion.button>
      </div>
    </motion.div>
  );
}