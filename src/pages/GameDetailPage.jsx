import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { signOut } from 'firebase/auth';
import './GameDetailPage.css';

function GameDetailPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameAndReviews = async () => {
      try {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
          setGame({ id: gameSnap.id, ...gameSnap.data() });
        }

        const reviewsQuery = query(collection(db, 'reviews'), where('gameId', '==', gameId));
        const reviewsSnap = await getDocs(reviewsQuery);
        const reviewsList = reviewsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (gameId) {
      fetchGameAndReviews();
    }
  }, [gameId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        gameId: gameId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email,
        rating: rating,
        comment: newReview,
        createdAt: new Date()
      });

      setNewReview('');
      setRating(5);

      // Refresh reviews
      const reviewsQuery = query(collection(db, 'reviews'), where('gameId', '==', gameId));
      const reviewsSnap = await getDocs(reviewsQuery);
      const reviewsList = reviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!game) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="game-detail-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        <button className="back-btn" onClick={() => navigate('/games')}>← Back to Games</button>

        <div className="game-header">
          <div className="game-cover-large">
            <img src={game.coverImage} alt={game.name} />
          </div>

          <div className="game-header-info">
            <h1>{game.name}</h1>
            <div className="game-meta">
              <span className="genre">{game.genre}</span>
              <span className="rating">⭐ {game.rating || 0} / 10</span>
            </div>
            <p className="description">{game.description}</p>

            <div className="game-stats-detailed">
              <div className="stat">
                <span>Downloads</span>
                <strong>{game.downloads || 0}</strong>
              </div>
              <div className="stat">
                <span>Release Date</span>
                <strong>{game.releaseDate || 'TBA'}</strong>
              </div>
              <div className="stat">
                <span>File Size</span>
                <strong>{game.fileSize || 'N/A'}</strong>
              </div>
            </div>

            <button className="btn btn-primary btn-large">
              📥 Download Game
            </button>
          </div>
        </div>

        {/* Screenshots */}
        {game.screenshots && game.screenshots.length > 0 && (
          <section className="screenshots-section">
            <h2>Screenshots</h2>
            <div className="screenshots-grid">
              {game.screenshots.map((screenshot, idx) => (
                <img key={idx} src={screenshot} alt={`Screenshot ${idx + 1}`} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="reviews-section">
          <h2>Reviews & Ratings</h2>

          <div className="review-form">
            <h3>Share Your Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Share your thoughts about this game..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <strong>{review.username}</strong>
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p>{review.comment}</p>
                  <small>{new Date(review.createdAt?.toDate()).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default GameDetailPage;
