import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

function HomePage() {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userSnap.exists()) setProfile(userSnap.data());

        const gamesSnap = await getDocs(query(collection(db, 'games'), limit(6)));
        setGames(gamesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading home page:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="screen-center">Loading...</div>;

  const stats = profile?.stats || {};

  return (
    <div className="page">
      <Navbar onLogout={handleLogout} />
      <main className="container">
        <h1 className="page-title">Welcome, {profile?.username || 'player'}</h1>

        <section className="stats">
          <div className="stat"><div className="value">{stats.gamesDownloaded || 0}</div><div className="label">Games downloaded</div></div>
          <div className="stat"><div className="value">{stats.gamesPlayed || 0}</div><div className="label">Games played</div></div>
          <div className="stat"><div className="value">{Math.round((stats.playtime || 0) / 60)} h</div><div className="label">Playtime</div></div>
          <div className="stat"><div className="value">{profile?.friends?.length || 0}</div><div className="label">Friends</div></div>
        </section>

        <h2 className="section-title">Games</h2>
        {games.length === 0 ? (
          <p className="muted">No games yet.</p>
        ) : (
          <div className="grid">
            {games.map((game) => (
              <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover" />}
                <div className="body">
                  <h3>{game.name}</h3>
                  <div className="meta">{game.genre} · {game.fileSize || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
