import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { MessageCircle, Users, UserRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const friendIds = me.exists() ? me.data().friends || [] : [];

        const friendDocs = await Promise.all(friendIds.map((id) => getDoc(doc(db, 'users', id))));
        setFriends(friendDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() })));

        const all = await getDocs(collection(db, 'users'));
        setPlayers(
          all.docs
            .filter((d) => d.id !== auth.currentUser.uid && !friendIds.includes(d.id))
            .map((d) => ({ id: d.id, ...d.data() })),
        );
      } catch (err) {
        console.error('Ошибка загрузки друзей:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="screen-center">Загрузка...</div>;

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <h1 className="page-title">Друзья</h1>

        <div className="two-col">
          <section>
            <h2 className="section-title" style={{ marginTop: 0 }}>
              <Users size={16} /> Мои друзья ({friends.length})
            </h2>
            <div className="card">
              {friends.length === 0 && <p className="muted">У вас пока нет друзей.</p>}
              {friends.map((f) => (
                <div key={f.id} className="list-item">
                  <div className="person">
                    <Avatar src={f.avatar} name={f.username} />
                    <div>
                      <strong>{f.username}</strong>
                      <div className="muted">Сыграно игр: {f.stats?.gamesPlayed || 0}</div>
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={() => navigate(`/chat/${f.id}`)}>
                    <MessageCircle size={14} /> Написать
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-title" style={{ marginTop: 0 }}>
              <UserRound size={16} /> Игроки
            </h2>
            <div className="card">
              {players.length === 0 && <p className="muted">Других игроков пока нет.</p>}
              {players.slice(0, 20).map((u) => (
                <div key={u.id} className="list-item">
                  <div className="person">
                    <Avatar src={u.avatar} name={u.username} />
                    <strong>{u.username}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default FriendsPage;
