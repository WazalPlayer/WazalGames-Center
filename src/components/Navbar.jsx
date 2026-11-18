import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Avatar from './Avatar';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/games', label: 'Games' },
  { to: '/friends', label: 'Friends' },
];

function Navbar({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.currentUser) return;
    getDoc(doc(db, 'users', auth.currentUser.uid))
      .then((snap) => snap.exists() && setProfile(snap.data()))
      .catch((err) => console.error('Error fetching user profile:', err));
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="brand" onClick={() => go('/')}>WazalGames Center</div>

      <nav className="nav-links">
        {LINKS.map((link) => (
          <button
            key={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            onClick={() => go(link.to)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="user-menu">
        <button className="avatar-btn" onClick={() => setOpen(!open)} aria-label="Account menu">
          <Avatar src={profile?.avatar} name={profile?.username} size={32} />
        </button>

        {open && (
          <div className="dropdown">
            <div className="dropdown-head">
              <strong>{profile?.username || 'Player'}</strong>
              <span>{auth.currentUser?.email}</span>
            </div>
            <button onClick={() => go('/profile')}>Profile</button>
            <button onClick={() => go('/games')}>Library</button>
            <button onClick={() => go('/friends')}>Friends</button>
            {profile?.role === 'admin' && <button onClick={() => go('/admin')}>Admin panel</button>}
            <button className="danger" onClick={() => { setOpen(false); onLogout(); }}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
