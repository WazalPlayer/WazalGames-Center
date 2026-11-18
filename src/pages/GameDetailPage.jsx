import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';

function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

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
    await addDoc(collection(db, 'reviews'), {
      gameId,
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName || auth.currentUser.email,
      rating,
      comment: text,
      createdAt: new Date(),
    });
    setText('');
    setRating(5);
    loadReviews();
  };

  if (!game) return <div className="screen-center">Loading...</div>;

  const hasDownload = game.downloadUrl && /^https?:\/\//.test(game.downloadUrl);

  return (
    <div className="page">
      <Navbar onLogout={() => signOut(auth)} />
      <main className="container">
        <button className="back" onClick={() => navigate('/games')}>← Back to games</button>

        <div className="detail-head">
          {game.coverImage ? <img className="cover" src={game.coverImage} alt={game.name} /> : <div className="cover" />}
          <div>
            <h1 className="page-title">{game.name}</h1>
            <div className="tags" style={{ marginBottom: 14 }}>
              <span className="tag">{game.genre}</span>
              {game.type && <span className="tag">{game.type.toUpperCase()}</span>}
            </div>
            <p className="muted" style={{ marginBottom: 20 }}>{game.description}</p>
            {hasDownload ? (
              <a className="btn btn-primary" href={game.downloadUrl} target="_blank" rel="noreferrer">Download</a>
            ) : (
              <span className="muted">Download is available in the desktop app.</span>
            )}
          </div>
        </div>

        <div className="kv">
          <div><span>Release date</span><strong>{game.releaseDate || '—'}</strong></div>
          <div><span>File size</span><strong>{game.fileSize || '—'}</strong></div>
          <div><span>Downloads</span><strong>{game.downloads || 0}</strong></div>
        </div>

        {game.screenshots?.length > 0 && (
          <>
            <h2 className="section-title">Screenshots</h2>
            <div className="shots">
              {game.screenshots.map((src, i) => <img key={i} src={src} alt={`Screenshot ${i + 1}`} />)}
            </div>
          </>
        )}

        <h2 className="section-title">Reviews</h2>
        <form className="card" onSubmit={submitReview} style={{ marginBottom: 16 }}>
          <div className="field">
            <label>Rating</label>
            <select className="input" style={{ width: 'auto' }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a review" />
          </div>
          <button className="btn btn-primary" type="submit">Post review</button>
        </form>

        {reviews.length === 0 ? (
          <p className="muted">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card" style={{ marginBottom: 10 }}>
              <div className="list-item" style={{ border: 'none', padding: 0 }}>
                <strong>{r.username}</strong>
                <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
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
