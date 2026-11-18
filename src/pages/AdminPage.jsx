import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Gamepad2, MessageSquare, Users, ShieldAlert, LayoutDashboard, LogOut, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { isAdminUser } from '../services/admin';
import GamesAdmin from './admin/GamesAdmin';
import ReviewsAdmin from './admin/ReviewsAdmin';
import UsersAdmin from './admin/UsersAdmin';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'games', label: 'Игры', Icon: Gamepad2, title: 'Игры', subtitle: 'Добавление, редактирование и удаление игр' },
  { id: 'reviews', label: 'Отзывы', Icon: MessageSquare, title: 'Отзывы', subtitle: 'Модерация отзывов игроков' },
  { id: 'users', label: 'Пользователи', Icon: Users, title: 'Пользователи', subtitle: 'Роли и доступ' },
];

function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);
  const [section, setSection] = useState('games');
  const [error, setError] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'users', auth.currentUser.uid)).then((snap) => {
      setAllowed(isAdminUser(auth.currentUser, snap.exists() ? snap.data() : null));
    });
  }, []);

  if (allowed === null) return <div className="screen-center">Загрузка...</div>;

  if (!allowed) {
    return (
      <div className="page">
        <Navbar onLogout={() => signOut(auth)} />
        <main className="container">
          <div className="empty">
            <ShieldAlert size={32} />
            <p>Доступ закрыт. Раздел только для администраторов.</p>
          </div>
        </main>
      </div>
    );
  }

  const current = SECTIONS.find((s) => s.id === section);

  const choose = (id) => {
    setSection(id);
    setError('');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LayoutDashboard size={20} />
          <span>Админ-панель</span>
        </div>
        <nav className="admin-nav">
          {SECTIONS.map(({ id, label, Icon }) => (
            <button key={id} className={section === id ? 'active' : ''} onClick={() => choose(id)}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <button onClick={() => navigate('/')}><ArrowLeft size={17} /> На сайт</button>
          <button className="danger" onClick={() => signOut(auth)}><LogOut size={17} /> Выйти</button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1>{current.title}</h1>
            <p className="muted">{current.subtitle}</p>
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        {section === 'games' && <GamesAdmin setError={setError} />}
        {section === 'reviews' && <ReviewsAdmin setError={setError} />}
        {section === 'users' && <UsersAdmin setError={setError} />}
      </div>
    </div>
  );
}

export default AdminPage;
