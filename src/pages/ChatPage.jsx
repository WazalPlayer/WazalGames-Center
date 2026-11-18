import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, realtimeDb } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, onValue } from 'firebase/database';
import Navbar from '../components/Navbar';
import './ChatPage.css';

function ChatPage() {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [friendProfile, setFriendProfile] = useState(null);
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const friendRef = doc(db, 'users', friendId);
        const friendSnap = await getDoc(friendRef);
        if (friendSnap.exists()) {
          setFriendProfile(friendSnap.data());
        }
      } catch (error) {
        console.error('Error fetching friend:', error);
      }
    };

    fetchFriend();

    // Listen for messages
    const chatId = [auth.currentUser.uid, friendId].sort().join('_');
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    return () => unsubscribe();
  }, [friendId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const chatId = [auth.currentUser.uid, friendId].sort().join('_');
      const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);

      await push(messagesRef, {
        sender: auth.currentUser.uid,
        text: messageText,
        timestamp: Date.now()
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="chat-page">
      <Navbar onLogout={handleLogout} />

      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate('/friends')}>←</button>
          <div className="chat-friend-info">
            {friendProfile && (
              <>
                <img src={friendProfile.avatar} alt={friendProfile.username} />
                <div>
                  <h2>{friendProfile.username}</h2>
                  <p>Online</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-list">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender === auth.currentUser.uid ? 'sent' : 'received'}`}
            >
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
