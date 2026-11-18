import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

const GENRES = ['All', 'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter'];

function GamesPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, 'games'))
      .then((snap) => setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((err) => console.error('Error fetching games:', err))
      .finally(() => setLoading(false));
  }, []);

  const visible = games.filter(
    (g) =>
      (genre === 'All' || g.genre === genre) &&
      (!search || g.name.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) return <div className="screen-center">Loading...</div>;

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <h1 className="page-title">Games</h1>

        <div className="toolbar">
          <input
            className="search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" style={{ width: 'auto' }} value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="muted">No games match your filters.</p>
        ) : (
          <div className="grid">
            {visible.map((game) => (
              <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover" />}
                <div className="body">
                  <h3>{game.name}</h3>
                  <div className="meta">{game.genre} · {game.fileSize || '—'}</div>
                  <div className="tags">
                    {game.type && <span className="tag">{game.type.toUpperCase()}</span>}
                    {game.rating ? <span className="tag">{game.rating} / 10</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default GamesPage;
