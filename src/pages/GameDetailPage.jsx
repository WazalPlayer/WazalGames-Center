import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ArrowLeft, Download, Star, Send, Monitor } from 'lucide-react';
import Navbar from '../components/Navbar';
import { genreName, platformName } from '../services/labels';
import { errorMessage } from '../services/errors';

function Stars({ value }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} fill={n <= value ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    const snap = await getDocs(query(collection(db, 'reviews'), where('gameId', '==', gameId)));
    setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    getDoc(doc(db, 'games', gameId)).then((snap) => {
      if (snap.exists()) setGame({ id: snap.id, ...snap.data() });
    });
    loadReviews();
  }, [gameId]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    try {
      await addDoc(collection(db, 'reviews'), {
        gameId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email,
        rating,
        comment: text.trim(),
        createdAt: new Date(),
      });
      setText('');
      setRating(5);
      loadReviews();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (!game) return <div className="screen-center">Загрузка...</div>;

  const hasDownload = game.downloadUrl && /^https?:\/\//.test(game.downloadUrl);

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <button className="back" onClick={() => navigate('/games')}>
          <ArrowLeft size={16} /> Назад к играм
        </button>

        <div className="detail-head">
          {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover cover-empty"><Monitor size={40} /></div>}
          <div>
            <h1 className="page-title">{game.name}</h1>
            <div className="tags" style={{ marginBottom: 14 }}>
              <span className="tag">{genreName(game.genre)}</span>
              <span className="tag">{platformName(game.type)}</span>
            </div>
            <p className="muted" style={{ marginBottom: 20 }}>{game.description}</p>
            {hasDownload ? (
              <a className="btn btn-primary" href={game.downloadUrl} target="_blank" rel="noreferrer">
                <Download size={16} /> Скачать
              </a>
            ) : (
              <span className="muted">Скачивание доступно в десктопном приложении.</span>
            )}
          </div>
        </div>

        <div className="kv">
          <div><span>Дата выхода</span><strong>{game.releaseDate || '—'}</strong></div>
          <div><span>Размер</span><strong>{game.fileSize || '—'}</strong></div>
          <div><span>Скачиваний</span><strong>{game.downloads || 0}</strong></div>
        </div>

        {game.screenshots?.length > 0 && (
          <>
            <h2 className="section-title">Скриншоты</h2>
            <div className="shots">
              {game.screenshots.map((src, i) => <img key={i} src={src} alt={`Скриншот ${i + 1}`} />)}
            </div>
          </>
        )}

        <h2 className="section-title">Отзывы</h2>
        <form className="card" onSubmit={submitReview} style={{ marginBottom: 16 }}>
          {error && <div className="error">{error}</div>}
          <div className="field">
            <label>Оценка</label>
            <select className="input select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишите отзыв" />
          </div>
          <button className="btn btn-primary" type="submit"><Send size={16} /> Отправить</button>
        </form>

        {reviews.length === 0 ? (
          <p className="muted">Отзывов пока нет.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div className="list-item" style={{ border: 'none', padding: 0 }}>
                <strong>{r.username}</strong>
                <Stars value={r.rating} />
              </div>
              <p style={{ marginTop: 6 }}>{r.comment}</p>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default GameDetailPage;
