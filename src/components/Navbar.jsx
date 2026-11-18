import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Home, Gamepad2, Users, User, Library, Shield, LogOut } from 'lucide-react';
import Avatar from './Avatar';
import { isAdminUser } from '../services/admin';

const LINKS = [
  { to: '/', label: 'Главная', Icon: Home },
  { to: '/games', label: 'Игры', Icon: Gamepad2 },
  { to: '/friends', label: 'Друзья', Icon: Users },
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
      .catch((err) => console.error('Ошибка загрузки профиля:', err));
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="brand" onClick={() => go('/')}>
        <Gamepad2 size={20} />
        WazalGames Center
      </div>

      <nav className="nav-links">
        {LINKS.map(({ to, label, Icon }) => (
          <button
            key={to}
            className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            onClick={() => go(to)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="user-menu">
        <button className="avatar-btn" onClick={() => setOpen(!open)} aria-label="Меню аккаунта">
          <Avatar src={profile?.avatar} name={profile?.username} size={32} />
        </button>

        {open && (
          <div className="dropdown">
            <div className="dropdown-head">
              <strong>{profile?.username || 'Игрок'}</strong>
              <span>{auth.currentUser?.email}</span>
            </div>
            <button onClick={() => go('/profile')}><User size={16} /> Профиль</button>
            <button onClick={() => go('/games')}><Library size={16} /> Библиотека</button>
            <button onClick={() => go('/friends')}><Users size={16} /> Друзья</button>
            {isAdminUser(auth.currentUser, profile) && (
              <button onClick={() => go('/admin')}><Shield size={16} /> Админ-панель</button>
            )}
            <button className="danger" onClick={() => { setOpen(false); onLogout(); }}>
              <LogOut size={16} /> Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
