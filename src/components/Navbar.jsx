import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';

function Navbar({ onLogout }) {
  const [userProfile, setUserProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (auth.currentUser) {
      fetchUserProfile();
    }
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleNavClick = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo" onClick={() => handleNavClick('/')}>
          <span className="logo-icon">🎮</span>
          <span className="logo-text">WazalGames</span>
        </div>
      </div>

      <div className={`nav-links ${showMenu ? 'active' : ''}`}>
        <a className={`nav-link ${isActive('/')}`} onClick={() => handleNavClick('/')}>
          Home
        </a>
        <a className={`nav-link ${isActive('/games')}`} onClick={() => handleNavClick('/games')}>
          Games
        </a>
        <a className={`nav-link ${isActive('/friends')}`} onClick={() => handleNavClick('/friends')}>
          Friends
        </a>
      </div>

      <div className="nav-right">
        <div className="user-menu">
          <img
            src={userProfile?.avatar || 'https://via.placeholder.com/150?text=Avatar'}
            alt="Avatar"
            className="avatar"
            onClick={() => setShowMenu(!showMenu)}
          />

          {showMenu && (
            <div className="dropdown-menu">
              <div className="user-info">
                <img src={userProfile?.avatar || 'https://via.placeholder.com/150?text=Avatar'} alt="Avatar" />
                <div>
                  <p className="username">{userProfile?.username || 'Player'}</p>
                  <p className="email">{auth.currentUser?.email}</p>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={() => handleNavClick('/profile')}>
                👤 Profile
              </button>
              <button className="dropdown-item" onClick={() => handleNavClick('/games')}>
                🎮 My Games
              </button>
              <button className="dropdown-item" onClick={() => handleNavClick('/friends')}>
                👥 Friends
              </button>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item logout" onClick={() => {
                setShowMenu(false);
                onLogout();
              }}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <button className="mobile-menu-btn" onClick={() => setShowMenu(!showMenu)}>
        ☰
      </button>
    </nav>
  );
}

export default Navbar;
