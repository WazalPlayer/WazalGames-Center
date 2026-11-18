import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, realtimeDb } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, onValue } from 'firebase/database';
import { ArrowLeft, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

function ChatPage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const logRef = useRef(null);

  const chatId = [auth.currentUser.uid, friendId].sort().join('_');

  useEffect(() => {
    getDoc(doc(db, 'users', friendId)).then((snap) => snap.exists() && setFriend(snap.data()));

    const unsubscribe = onValue(ref(realtimeDb, `chats/${chatId}/messages`), (snapshot) => {
      const data = snapshot.val() || {};
      setMessages(
        Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .sort((a, b) => a.timestamp - b.timestamp),
      );
    });
    return () => unsubscribe();
  }, [friendId, chatId]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await push(ref(realtimeDb, `chats/${chatId}/messages`), {
      sender: auth.currentUser.uid,
      text: text.trim(),
      timestamp: Date.now(),
    });
    setText('');
  };

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <div className="chat">
        <div className="chat-head">
          <button className="back" style={{ margin: 0 }} onClick={() => navigate('/friends')}>
            <ArrowLeft size={16} /> Назад
          </button>
          {friend && (
            <div className="person">
              <Avatar src={friend.avatar} name={friend.username} />
              <strong>{friend.username}</strong>
            </div>
          )}
        </div>

        <div className="chat-log" ref={logRef}>
          {messages.length === 0 && <p className="muted">Сообщений пока нет.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.sender === auth.currentUser.uid ? 'mine' : ''}`}>
              {m.text}
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={send}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Сообщение" />
          <button className="btn btn-primary" type="submit"><Send size={16} /> Отправить</button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
