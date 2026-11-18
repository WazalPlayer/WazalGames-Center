import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Trash2, MessageSquare, Star } from 'lucide-react';
import { errorMessage } from '../../services/errors';

export default function ReviewsAdmin({ setError }) {
  const [reviews, setReviews] = useState([]);
  const [games, setGames] = useState({});

  const load = async () => {
    const [reviewSnap, gameSnap] = await Promise.all([getDocs(collection(db, 'reviews')), getDocs(collection(db, 'games'))]);
    setGames(Object.fromEntries(gameSnap.docs.map((d) => [d.id, d.data().name])));
    setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err)));
  }, []);

  const remove = async (review) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="empty">
        <MessageSquare size={32} />
        <p>Отзывов пока нет.</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((r) => (
        <article key={r.id} className="review-item">
          <div className="review-top">
            <div>
              <strong>{r.username}</strong>
              <span className="meta"> · {games[r.gameId] || 'игра удалена'}</span>
            </div>
            <span className="review-rating"><Star size={13} fill="currentColor" /> {r.rating} / 5</span>
          </div>
          <p>{r.comment}</p>
          <div className="review-actions">
            <button className="btn btn-sm btn-danger" onClick={() => remove(r)}><Trash2 size={14} /> Удалить</button>
          </div>
        </article>
      ))}
    </div>
  );
}
