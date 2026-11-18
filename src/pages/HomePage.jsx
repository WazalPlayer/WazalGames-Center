import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { Download, Gamepad2, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import { genreName } from '../services/labels';

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
        console.error('Ошибка загрузки главной страницы:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="screen-center">Загрузка...</div>;

  const stats = profile?.stats || {};

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <section className="hero">
          <div>
            <h1>Добро пожаловать, {profile?.username || 'игрок'}</h1>
            <p>Скачивайте игры, оставляйте отзывы и играйте с друзьями.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/games')}>
            <Gamepad2 size={16} /> Открыть каталог
          </button>
        </section>

        <section className="stats">
          <div className="stat">
            <Download size={18} className="stat-icon" />
            <div className="value">{stats.gamesDownloaded || 0}</div>
            <div className="label">Скачано игр</div>
          </div>
          <div className="stat">
            <Gamepad2 size={18} className="stat-icon" />
            <div className="value">{stats.gamesPlayed || 0}</div>
            <div className="label">Сыграно игр</div>
          </div>
          <div className="stat">
            <Clock size={18} className="stat-icon" />
            <div className="value">{Math.round((stats.playtime || 0) / 60)} ч</div>
            <div className="label">Время в играх</div>
          </div>
          <div className="stat">
            <Users size={18} className="stat-icon" />
            <div className="value">{profile?.friends?.length || 0}</div>
            <div className="label">Друзья</div>
          </div>
        </section>

        <h2 className="section-title">Игры</h2>
        {games.length === 0 ? (
          <p className="muted">Игр пока нет.</p>
        ) : (
          <div className="grid">
            {games.map((game) => (
              <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover cover-empty"><Gamepad2 size={32} /></div>}
                <div className="body">
                  <h3>{game.name}</h3>
                  <div className="meta">{genreName(game.genre)} · {game.fileSize || '—'}</div>
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
