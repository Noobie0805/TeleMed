import React, { useState } from 'react';
import './LiveChatWidget.css';

function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hi! How can we help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { from: 'user', text: input }]);
      setInput('');
    }
  };

  return (
    <div className={`live-chat-widget${open ? ' open' : ''}`}> 
      {open ? (
        <div className="chat-window">
          <div className="chat-header">
            <span>Live Support</span>
            <button className="chat-close" onClick={() => setOpen(false)} title="Close chat">×</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.from}`}>{msg.text}</div>
            ))}
          </div>
          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              autoFocus
            />
            <button type="submit" className="chat-send">Send</button>
          </form>
        </div>
      ) : (
        <button className="chat-fab" onClick={() => setOpen(true)} title="Chat with support">
          <span role="img" aria-label="Chat">💬</span>
        </button>
      )}
    </div>
  );
}

export default LiveChatWidget; 