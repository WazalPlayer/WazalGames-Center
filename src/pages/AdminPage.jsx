import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Pencil, Trash2, ShieldAlert, Upload, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { GENRES, genreName, platformName } from '../services/labels';
import { errorMessage } from '../services/errors';

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
  const [error, setError] = useState('');

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
    setError('');
    try {
      const url = await uploadFile(file, 'covers');
      setForm((f) => ({ ...f, coverImage: url }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onScreenshots = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const urls = await Promise.all(files.map((file) => uploadFile(file, 'screenshots')));
      setForm((f) => ({ ...f, screenshots: [...f.screenshots, ...urls] }));
    } catch (err) {
      setError(errorMessage(err));
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
    setError('');
    const data = {
      ...form,
      rating: Number(form.rating) || 0,
      downloads: Number(form.downloads) || 0,
      updatedAt: new Date(),
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'games', editingId), data);
      } else {
        await addDoc(collection(db, 'games'), { ...data, createdAt: new Date() });
      }
      setShowForm(false);
      setEditingId(null);
      loadGames();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (game) => {
    if (!window.confirm(`Удалить игру «${game.name}»?`)) return;
    try {
      await deleteDoc(doc(db, 'games', game.id));
      loadGames();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (isAdmin === null) return <div className="screen-center">Загрузка...</div>;

  if (!isAdmin) {
    return (
      <div className="page">
        <Navbar onLogout={() => signOut(auth)} />
        <main className="container">
          <p className="muted"><ShieldAlert size={16} /> Доступ закрыт. Раздел только для администраторов.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <div className="page-head">
          <h1 className="page-title">Админ-панель</h1>
          <button className="btn btn-primary" onClick={() => (showForm ? setShowForm(false) : openNew())}>
            {showForm ? <><X size={16} /> Закрыть</> : <><Plus size={16} /> Добавить игру</>}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form className="card" onSubmit={save} style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>{editingId ? 'Редактирование игры' : 'Новая игра'}</h2>

            <div className="form-row">
              <div className="field"><label>Название</label><input value={form.name} onChange={set('name')} required /></div>
              <div className="field"><label>Жанр</label>
                <select value={form.genre} onChange={set('genre')}>
                  {Object.keys(GENRES).map((key) => <option key={key} value={key}>{genreName(key)}</option>)}
                </select>
              </div>
            </div>

            <div className="field"><label>Описание</label><textarea rows={3} value={form.description} onChange={set('description')} /></div>

            <div className="form-row">
              <div className="field"><label>Дата выхода</label><input type="date" value={form.releaseDate} onChange={set('releaseDate')} /></div>
              <div className="field"><label>Размер</label><input placeholder="например, 180 МБ" value={form.fileSize} onChange={set('fileSize')} /></div>
            </div>

            <div className="form-row">
              <div className="field"><label>Ссылка на скачивание (https://)</label><input value={form.downloadUrl} onChange={set('downloadUrl')} /></div>
              <div className="field"><label>Платформа</label>
                <select value={form.type} onChange={set('type')}>
                  <option value="pc">{platformName('pc')}</option>
                  <option value="mobile">{platformName('mobile')}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Обложка</label>
                <input type="file" accept="image/*" onChange={onCover} />
                {form.coverImage && <div className="muted" style={{ marginTop: 6 }}>Обложка загружена</div>}
              </div>
              <div className="field">
                <label>Скриншоты</label>
                <input type="file" accept="image/*" multiple onChange={onScreenshots} />
                <div className="muted" style={{ marginTop: 6 }}>Загружено: {form.screenshots.length}</div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? <><Upload size={16} /> Загрузка файлов...</> : editingId ? <><Save size={16} /> Сохранить</> : <><Plus size={16} /> Создать игру</>}
            </button>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Название</th><th>Жанр</th><th>Платформа</th><th>Размер</th><th></th></tr>
            </thead>
            <tbody>
              {games.length === 0 && <tr><td colSpan={5} className="muted">Игр пока нет.</td></tr>}
              {games.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{genreName(g.genre)}</td>
                  <td>{platformName(g.type)}</td>
                  <td>{g.fileSize || '—'}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => openEdit(g)}><Pencil size={14} /> Изменить</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(g)}><Trash2 size={14} /> Удалить</button>
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
