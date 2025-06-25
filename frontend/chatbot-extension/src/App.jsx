import React, { useState, useEffect } from 'react';

const vscode = acquireVsCodeApi();

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    vscode.postMessage({ type: 'chat', text: input });
    setInput('');
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'response') {
        setMessages((prev) => [...prev, { sender: 'ai', text: message.text }]);
      }
    });
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: '1rem' }}>
      <h2>💬 AI Chat</h2>
      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> <pre>{msg.text}</pre>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
