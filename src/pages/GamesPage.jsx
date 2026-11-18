import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import './GamesPage.css';

function GamesPage() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const genres = ['All', 'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter'];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesQuery = collection(db, 'games');
        const gamesSnap = await getDocs(gamesQuery);
        const gamesList = gamesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesList);
        setFilteredGames(gamesList);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    let filtered = games;

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(game => game.genre === selectedGenre);
    }

    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGames(filtered);
  }, [searchTerm, selectedGenre, games]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading games...</div>;
  }

  return (
    <div className="games-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        <h1>All Games 🎮</h1>

        {/* Filters */}
        <div className="games-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="genre-filter">
            {genres.map(genre => (
              <button
                key={genre}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="games-grid">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="game-cover">
                  <img src={game.coverImage} alt={game.name} />
                  <div className="game-badge">{game.genre}</div>
                </div>
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p className="description">{game.description?.substring(0, 100)}...</p>
                  <div className="game-stats">
                    <span>⭐ {game.rating || 0}</span>
                    <span>📥 {game.downloads || 0}</span>
                  </div>
                  <button className="btn btn-primary btn-sm">View</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-games">
              <p>No games found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamesPage;
