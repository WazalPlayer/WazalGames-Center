import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';

const EMPTY = {
  name: '',
  description: '',
  genre: 'Action',
  releaseDate: '',
  fileSize: '',
  downloadUrl: '',
  coverImage: '',
  screenshots: [],
  rating: 0,
  downloads: 0,
  type: 'pc',
};

function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadGames = async () => {
    const snap = await getDocs(collection(db, 'games'));
    setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    getDoc(doc(db, 'users', auth.currentUser.uid)).then((snap) => {
      const admin = snap.exists() && snap.data().role === 'admin';
      setIsAdmin(admin);
      if (admin) loadGames();
    });
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const uploadFile = async (file, folder) => {
    const fileRef = ref(storage, `games/${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const onCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file, 'covers');
      setForm((f) => ({ ...f, coverImage: url }));
    } finally {
      setBusy(false);
    }
  };

  const onScreenshots = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(files.map((file) => uploadFile(file, 'screenshots')));
      setForm((f) => ({ ...f, screenshots: [...f.screenshots, ...urls] }));
    } finally {
      setBusy(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (game) => {
    setEditingId(game.id);
    setForm({ ...EMPTY, ...game });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const data = { ...form, rating: Number(form.rating) || 0, downloads: Number(form.downloads) || 0, updatedAt: new Date() };
    if (editingId) {
      await updateDoc(doc(db, 'games', editingId), data);
    } else {
      await addDoc(collection(db, 'games'), { ...data, createdAt: new Date() });
    }
    setShowForm(false);
    setEditingId(null);
    loadGames();
  };

  const remove = async (game) => {
    if (!window.confirm(`Delete "${game.name}"?`)) return;
    await deleteDoc(doc(db, 'games', game.id));
    loadGames();
  };

  if (isAdmin === null) return <div className="screen-center">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="page">
        <Navbar onLogout={() => signOut(auth)} />
        <main className="container"><p className="muted">Access denied. This page is for administrators.</p></main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <div className="list-item" style={{ padding: 0, marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Admin panel</h1>
          <button className="btn btn-primary" onClick={() => (showForm ? setShowForm(false) : openNew())}>
            {showForm ? 'Close' : 'Add game'}
          </button>
        </div>

        {showForm && (
          <form className="card" onSubmit={save} style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>{editingId ? 'Edit game' : 'New game'}</h2>

            <div className="form-row">
              <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
              <div className="field"><label>Genre</label>
                <select value={form.genre} onChange={set('genre')}>
                  {['Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Shooter'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={set('description')} /></div>

            <div className="form-row">
              <div className="field"><label>Release date</label><input type="date" value={form.releaseDate} onChange={set('releaseDate')} /></div>
              <div className="field"><label>File size</label><input placeholder="e.g. 180 MB" value={form.fileSize} onChange={set('fileSize')} /></div>
            </div>

            <div className="form-row">
              <div className="field"><label>Download URL (https://)</label><input value={form.downloadUrl} onChange={set('downloadUrl')} /></div>
              <div className="field"><label>Platform</label>
                <select value={form.type} onChange={set('type')}>
                  <option value="pc">PC</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field"><label>Cover image</label><input type="file" accept="image/*" onChange={onCover} />
                {form.coverImage && <div className="muted" style={{ marginTop: 6 }}>Cover uploaded</div>}
              </div>
              <div className="field"><label>Screenshots</label><input type="file" accept="image/*" multiple onChange={onScreenshots} />
                <div className="muted" style={{ marginTop: 6 }}>{form.screenshots.length} uploaded</div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Uploading...' : editingId ? 'Save changes' : 'Create game'}
            </button>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Genre</th><th>Platform</th><th>Size</th><th></th></tr>
            </thead>
            <tbody>
              {games.length === 0 && <tr><td colSpan={5} className="muted">No games yet.</td></tr>}
              {games.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.genre}</td>
                  <td>{(g.type || '').toUpperCase()}</td>
                  <td>{g.fileSize || '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm" onClick={() => openEdit(g)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => remove(g)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
