import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { Pencil, Save, X, Trash2, KeyRound, Download, Gamepad2, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { errorMessage } from '../services/errors';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
  const [account, setAccount] = useState({ game: '', login: '', password: '' });
  const [error, setError] = useState('');
  const ref = doc(db, 'users', auth.currentUser.uid);

  const load = async () => {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setProfile(data);
      setForm({ username: data.username || '', bio: data.bio || '', avatar: data.avatar || '' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (action) => {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saveProfile = (e) => {
    e.preventDefault();
    run(async () => {
      await updateDoc(ref, form);
      setEditing(false);
    });
  };

  const saveAccount = (e) => {
    e.preventDefault();
    const game = account.game.trim();
    if (!game) return;
    run(async () => {
      await updateDoc(ref, {
        [`gameAccounts.${game}`]: { username: account.login, password: account.password },
      });
      setAccount({ game: '', login: '', password: '' });
    });
  };

  const removeAccount = (game) => run(() => updateDoc(ref, { [`gameAccounts.${game}`]: deleteField() }));

  if (!profile) return <div className="screen-center">Загрузка...</div>;

  const stats = profile.stats || {};
  const accounts = Object.entries(profile.gameAccounts || {});

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <h1 className="page-title">Профиль</h1>
        {error && <div className="error">{error}</div>}

        <div className="card profile-head">
          <Avatar src={profile.avatar} name={profile.username} size={72} />
          <div className="grow">
            <div className="profile-name">{profile.username}</div>
            <div className="muted">{auth.currentUser.email}</div>
            <div className="muted" style={{ marginTop: 4 }}>{profile.bio || 'Описание не заполнено'}</div>
          </div>
          <button className="btn" onClick={() => setEditing(!editing)}>
            {editing ? <><X size={16} /> Отмена</> : <><Pencil size={16} /> Редактировать</>}
          </button>
        </div>

        {editing && (
          <form className="card" onSubmit={saveProfile} style={{ marginTop: 16 }}>
            <div className="field">
              <label>Имя пользователя</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>Ссылка на аватар</label>
              <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <div className="field">
              <label>О себе</label>
              <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit"><Save size={16} /> Сохранить</button>
          </form>
        )}

        <section className="stats" style={{ marginTop: 20 }}>
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
        </section>

        <h2 className="section-title">Аккаунты в играх</h2>
        <div className="card">
          {accounts.length === 0 && <p className="muted">Аккаунты пока не сохранены.</p>}
          {accounts.map(([game, acc]) => (
            <div key={game} className="list-item">
              <div>
                <strong>{game}</strong>
                <div className="muted">{acc.username}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => removeAccount(game)}>
                <Trash2 size={14} /> Удалить
              </button>
            </div>
          ))}

          <form onSubmit={saveAccount} className="form-row" style={{ marginTop: 16 }}>
            <div className="field">
              <label>Игра</label>
              <input value={account.game} onChange={(e) => setAccount({ ...account, game: e.target.value })} />
            </div>
            <div className="field">
              <label>Имя аккаунта</label>
              <input value={account.login} onChange={(e) => setAccount({ ...account, login: e.target.value })} />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            </div>
            <div className="field-action">
              <button className="btn" type="submit"><KeyRound size={16} /> Сохранить аккаунт</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
