import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './FriendsPage.css';

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const friendIds = userSnap.data().friends || [];

          if (friendIds.length > 0) {
            const friendsList = [];
            for (const friendId of friendIds) {
              const friendRef = doc(db, 'users', friendId);
              const friendSnap = await getDoc(friendRef);
              if (friendSnap.exists()) {
                friendsList.push({
                  id: friendId,
                  ...friendSnap.data()
                });
              }
            }
            setFriends(friendsList);
          }
        }

        // Fetch all users for adding new friends
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== auth.currentUser.uid);
        setAllUsers(usersList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading friends...</div>;
  }

  return (
    <div className="friends-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        <h1>Friends 👥</h1>

        <div className="friends-container">
          {/* Friends List */}
          <section className="friends-list">
            <h2>My Friends ({friends.length})</h2>
            <div className="friends-grid">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.id} className="friend-card">
                    <img src={friend.avatar} alt={friend.username} />
                    <h3>{friend.username}</h3>
                    <p>{friend.stats?.gamesPlayed || 0} games played</p>
                    <button
                      className="btn btn-sm"
                      onClick={() => navigate(`/chat/${friend.id}`)}
                    >
                      Message
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-friends">No friends yet. Add some friends!</p>
              )}
            </div>
          </section>

          {/* Add Friends */}
          <section className="add-friends">
            <h2>Add Friends</h2>
            <div className="friends-grid">
              {allUsers
                .filter(user => !friends.find(f => f.id === user.id))
                .slice(0, 6)
                .map(user => (
                  <div key={user.id} className="friend-card">
                    <img src={user.avatar} alt={user.username} />
                    <h3>{user.username}</h3>
                    <p>{user.stats?.gamesPlayed || 0} games played</p>
                    <button className="btn btn-primary btn-sm">
                      Add Friend
                    </button>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;
