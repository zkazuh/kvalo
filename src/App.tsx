import { useEffect, useState } from 'react';
import { nickGen } from './utilities/scripts';
import { ref, push, onValue } from 'firebase/database';
import { database } from './services/firebase';

type Message = {
  nick: string;
  text: string;
  timestamp: number;
};

function App() {
  const [nick] = useState(nickGen());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div id="chat">
      <title>Bostil</title>
      <h1>Global chat</h1>
      <div id="chat-messages">
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <strong>{message.nick}</strong>: {message.text}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              const messageRef = ref(database, 'messages');
              push(messageRef, {
                nick,
                text: inputValue.trim(),
                timestamp: Date.now(),
              });
              setInputValue('');
            }
          }}
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
    </div>
  );
}

export default App;