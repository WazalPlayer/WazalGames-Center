import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import './HomePage.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndGames = async () => {
      try {
        // Get user profile
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }

        // Get featured games
        const gamesQuery = query(collection(db, 'games'), limit(6));
        const gamesSnap = await getDocs(gamesQuery);
        const gamesList = gamesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesList);

        setUser(auth.currentUser);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGames();
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome, {userProfile?.username || 'Player'}!</h1>
            <p>Explore and download amazing games</p>
            <button className="btn btn-primary" onClick={() => navigate('/games')}>
              Browse All Games
            </button>
          </div>
          <div className="welcome-graphic">
            <div className="game-controller">🎮</div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>{userProfile?.stats?.gamesDownloaded || 0}</h3>
              <p>Games Downloaded</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{userProfile?.friends?.length || 0}</h3>
              <p>Friends</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{Math.round((userProfile?.stats?.playtime || 0) / 60)}h</h3>
              <p>Total Playtime</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Level {Math.floor((userProfile?.stats?.gamesPlayed || 0) / 5) + 1}</h3>
              <p>Player Level</p>
            </div>
          </div>
        </section>

        {/* Featured Games */}
        <section className="featured-games">
          <h2>Featured Games 🎯</h2>
          <div className="games-grid">
            {games.length > 0 ? (
              games.map(game => (
                <div key={game.id} className="game-card featured">
                  <div className="game-cover">
                    <img src={game.coverImage} alt={game.name} />
                    <div className="game-overlay">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="game-genre">{game.genre}</p>
                    <div className="game-rating">
                      <span>⭐ {game.rating || 0} / 10</span>
                      <span className="download-count">📥 {game.downloads || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-games">
                <p>No games available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/games')}>
              <div className="action-icon">🎮</div>
              <h3>Browse Games</h3>
              <p>Discover and download new games</p>
            </div>
            <div className="action-card" onClick={() => navigate('/profile')}>
              <div className="action-icon">👤</div>
              <h3>My Profile</h3>
              <p>Manage your account and settings</p>
            </div>
            <div className="action-card" onClick={() => navigate('/friends')}>
              <div className="action-icon">👥</div>
              <h3>Friends</h3>
              <p>Add friends and view their profiles</p>
            </div>
            <div className="action-card" onClick={() => navigate('/games')}>
              <div className="action-icon">📺</div>
              <h3>My Games</h3>
              <p>Manage your downloaded games</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
