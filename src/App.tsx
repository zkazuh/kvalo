import { useEffect, useState } from 'react';
import { nickGen } from './utilities/scripts';
import { ref, push, onValue } from 'firebase/database';
import { database } from './services/firebase';
import './components/app.css';

type Message = {
  nick: string;
  text: string;
  timestamp: number ;
  dateString: string;
};

function App() {
  const [nick] = useState(nickGen());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const visibleMessagesCount = messages.slice(-100);

  useEffect(() => {
    const messageRef = ref(database, 'messages');

    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
              const msgs = Object.values(data as Record<string, unknown>)
                .filter((m): m is Message => {
                  return (
                    typeof m === 'object' &&
                    m !== null &&
                    'nick' in m &&
                    'text' in m &&
                    'timestamp' in m
                  );
                })
                .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
      }
    });
  }, []);

  const submitMessage = 
(e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const messageRef = ref(database, 'messages');
      push(messageRef, {
        nick,
        text: inputValue.trim(),
        timestamp: Date.now(),
        dateString: new Date().toLocaleString(),
      });
      setInputValue('');
    }
  }

  return (
    <div id="chat">
      <title>Bostil</title>
      <h1>Global chat</h1>
      <div id="chat-messages">
        <div id="chat-header">
          {visibleMessagesCount.map((message, index) => (
            <div className="chat-message" key ={index}>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              <strong>{" "}{message.nick}</strong>: {message.text}
            </div>
          ))}
        </div>
      </div>
          <form id="chat-form"
          onSubmit={(e) => {submitMessage(e)}}
          >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type..."
          />
          <button type="submit">Send</button>
        </form>
    </div>
  );
}

export default App;