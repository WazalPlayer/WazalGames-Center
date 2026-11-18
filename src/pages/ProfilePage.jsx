import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
  const [account, setAccount] = useState({ game: '', login: '', password: '' });
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

  const saveProfile = async (e) => {
    e.preventDefault();
    await updateDoc(ref, form);
    setEditing(false);
    load();
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    if (!account.game.trim()) return;
    await updateDoc(ref, {
      [`gameAccounts.${account.game.trim()}`]: { username: account.login, password: account.password },
    });
    setAccount({ game: '', login: '', password: '' });
    load();
  };

  const removeAccount = async (game) => {
    await updateDoc(ref, { [`gameAccounts.${game}`]: deleteField() });
    load();
  };

  if (!profile) return <div className="screen-center">Loading...</div>;

  const stats = profile.stats || {};
  const accounts = Object.entries(profile.gameAccounts || {});

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <h1 className="page-title">Profile</h1>

        <div className="card" style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
          <Avatar src={profile.avatar} name={profile.username} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{profile.username}</div>
            <div className="muted">{auth.currentUser.email}</div>
            <div className="muted" style={{ marginTop: 4 }}>{profile.bio || 'No bio yet'}</div>
          </div>
          <button className="btn" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
        </div>

        {editing && (
          <form className="card" onSubmit={saveProfile} style={{ marginBottom: 20 }}>
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>Avatar URL</label>
              <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <div className="field">
              <label>Bio</label>
              <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        )}

        <section className="stats">
          <div className="stat"><div className="value">{stats.gamesDownloaded || 0}</div><div className="label">Games downloaded</div></div>
          <div className="stat"><div className="value">{stats.gamesPlayed || 0}</div><div className="label">Games played</div></div>
          <div className="stat"><div className="value">{Math.round((stats.playtime || 0) / 60)} h</div><div className="label">Playtime</div></div>
        </section>

        <h2 className="section-title">Game accounts</h2>
        <div className="card">
          {accounts.length === 0 && <p className="muted">No game accounts saved.</p>}
          {accounts.map(([game, acc]) => (
            <div key={game} className="list-item">
              <div>
                <strong>{game}</strong>
                <div className="muted">{acc.username}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => removeAccount(game)}>Remove</button>
            </div>
          ))}

          <form onSubmit={saveAccount} className="form-row" style={{ marginTop: 16 }}>
            <div className="field"><label>Game</label><input value={account.game} onChange={(e) => setAccount({ ...account, game: e.target.value })} /></div>
            <div className="field"><label>Account name</label><input value={account.login} onChange={(e) => setAccount({ ...account, login: e.target.value })} /></div>
            <div className="field"><label>Password</label><input type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} /></div>
            <div style={{ alignSelf: 'end', marginBottom: 14 }}>
              <button className="btn" type="submit">Save account</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
