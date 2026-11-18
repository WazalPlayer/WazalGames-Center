import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Gamepad2, Monitor, Smartphone, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { GENRES, genreName, platformName } from '../services/labels';

function GamesPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, 'games'))
      .then((snap) => setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((err) => console.error('Ошибка загрузки игр:', err))
      .finally(() => setLoading(false));
  }, []);

  const visible = games.filter(
    (g) =>
      (genre === 'all' || g.genre === genre) &&
      (!search || g.name.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) return <div className="screen-center">Загрузка...</div>;

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <h1 className="page-title">Игры</h1>

        <div className="toolbar">
          <div className="input-icon search-wrap">
            <Search size={16} />
            <input placeholder="Поиск по названию" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input select" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="all">Все жанры</option>
            {Object.keys(GENRES).map((key) => <option key={key} value={key}>{genreName(key)}</option>)}
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="muted">Ничего не найдено.</p>
        ) : (
          <div className="grid">
            {visible.map((game) => {
              const PlatformIcon = game.type === 'mobile' ? Smartphone : Monitor;
              return (
                <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                  {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover cover-empty"><Gamepad2 size={32} /></div>}
                  <div className="body">
                    <h3>{game.name}</h3>
                    <div className="meta">{genreName(game.genre)} · {game.fileSize || '—'}</div>
                    <div className="tags">
                      <span className="tag"><PlatformIcon size={12} /> {platformName(game.type)}</span>
                      {game.rating ? <span className="tag"><Star size={12} /> {game.rating} / 10</span> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default GamesPage;
