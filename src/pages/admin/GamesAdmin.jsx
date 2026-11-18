import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Plus, Search, Pencil, Trash2, Gamepad2, Monitor, Smartphone } from 'lucide-react';
import GameForm from './GameForm';
import { genreName } from '../../services/labels';
import { errorMessage } from '../../services/errors';

export default function GamesAdmin({ setError }) {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    const snap = await getDocs(collection(db, 'games'));
    setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err)));
  }, []);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (game) => {
    setEditing(game);
    setFormOpen(true);
  };

  const remove = async (game) => {
    if (!window.confirm(`Удалить игру «${game.name}»?`)) return;
    try {
      await deleteDoc(doc(db, 'games', game.id));
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const visible = games.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase()));
  const pcCount = games.filter((g) => g.type !== 'mobile').length;
  const mobileCount = games.length - pcCount;

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat"><Gamepad2 size={18} /><div><strong>{games.length}</strong><span>Всего игр</span></div></div>
        <div className="admin-stat"><Monitor size={18} /><div><strong>{pcCount}</strong><span>ПК</span></div></div>
        <div className="admin-stat"><Smartphone size={18} /><div><strong>{mobileCount}</strong><span>Мобильные</span></div></div>
      </div>

      <div className="admin-toolbar">
        <div className="input-icon search-wrap">
          <Search size={16} />
          <input placeholder="Поиск игр" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Добавить игру</button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <Gamepad2 size={32} />
          <p>{games.length === 0 ? 'Игр пока нет. Добавьте первую.' : 'Ничего не найдено.'}</p>
        </div>
      ) : (
        <div className="admin-games">
          {visible.map((game) => (
            <article key={game.id} className="admin-game">
              <div className="admin-game-cover">
                {game.coverImage ? (
                  <img src={game.coverImage} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <Gamepad2 size={28} />
                )}
              </div>
              <div className="admin-game-body">
                <div className="admin-game-title">{game.name}</div>
                <div className="meta">{genreName(game.genre)} · {game.type === 'mobile' ? 'Мобильная' : 'ПК'}{game.fileSize ? ` · ${game.fileSize}` : ''}</div>
                <div className="meta">Скриншотов: {game.screenshots?.length || 0}</div>
              </div>
              <div className="admin-game-actions">
                <button className="btn btn-sm" onClick={() => openEdit(game)}><Pencil size={14} /> Изменить</button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(game)} aria-label="Удалить"><Trash2 size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <GameForm
          game={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}
