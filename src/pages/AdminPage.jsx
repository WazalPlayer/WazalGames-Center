import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import './AdminPage.css';

function AdminPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: 'Action',
    releaseDate: '',
    fileSize: '',
    downloadUrl: '',
    coverImage: '',
    rating: 0,
    downloads: 0,
    type: 'pc',
    exePath: ''
  });
  const navigate = useNavigate();

  // Check if admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          if (data.role !== 'admin') {
            navigate('/');
          }
        }

        const gamesSnap = await getDocs(collection(db, 'games'));
        const gamesList = gamesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesList);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'downloads' ? parseFloat(value) : value
    }));
  };

  const handleImageUpload = async (file, type) => {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `games/${type}/${fileName}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setFormData(prev => ({
        ...prev,
        [type === 'cover' ? 'coverImage' : 'screenshots']: type === 'cover' ? url : [...(prev.screenshots || []), url]
      }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGame) {
        const gameRef = doc(db, 'games', editingGame.id);
        await updateDoc(gameRef, {
          ...formData,
          updatedAt: new Date()
        });
        alert('✅ Game updated!');
      } else {
        await addDoc(collection(db, 'games'), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('✅ Game added!');
      }

      setFormData({
        name: '',
        description: '',
        genre: 'Action',
        releaseDate: '',
        fileSize: '',
        downloadUrl: '',
        coverImage: '',
        rating: 0,
        downloads: 0,
        type: 'pc',
        exePath: ''
      });
      setShowForm(false);
      setEditingGame(null);

      // Reload games
      const gamesSnap = await getDocs(collection(db, 'games'));
      const gamesList = gamesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGames(gamesList);
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game: ' + error.message);
    }
  };

  const handleEdit = (game) => {
    setFormData(game);
    setEditingGame(game);
    setShowForm(true);
  };

  const handleDelete = async (gameId) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
        setGames(games.filter(g => g.id !== gameId));
        alert('✅ Game deleted!');
      } catch (error) {
        console.error('Delete error:', error);
      }
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        <div className="admin-header">
          <h1>🛡️ Admin Panel</h1>
          <button className="btn btn-primary" onClick={() => {
            setShowForm(!showForm);
            setEditingGame(null);
            setFormData({
              name: '',
              description: '',
              genre: 'Action',
              releaseDate: '',
              fileSize: '',
              downloadUrl: '',
              coverImage: '',
              rating: 0,
              downloads: 0,
              type: 'pc',
              exePath: ''
            });
          }}>
            {showForm ? '✕ Cancel' : '+ Add Game'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="admin-form-container">
            <h2>{editingGame ? 'Edit Game' : 'Add New Game'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Game Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <select name="genre" value={formData.genre} onChange={handleInputChange}>
                    <option>Action</option>
                    <option>Adventure</option>
                    <option>RPG</option>
                    <option>Strategy</option>
                    <option>Puzzle</option>
                    <option>Shooter</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>File Size</label>
                  <input type="text" name="fileSize" placeholder="e.g., 2.5 GB" value={formData.fileSize} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rating (0-10)</label>
                  <input type="number" name="rating" min="0" max="10" step="0.1" value={formData.rating} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Downloads</label>
                  <input type="number" name="downloads" value={formData.downloads} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Download URL *</label>
                <input
                  type="url"
                  name="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>EXE Path (for launcher)</label>
                <input type="text" name="exePath" placeholder="games/pc/game.exe" value={formData.exePath} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'cover')}
                />
                {formData.coverImage && <p>✅ Image uploaded</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                {editingGame ? 'Update Game' : 'Add Game'}
              </button>
            </form>
          </div>
        )}

        {/* Games List */}
        <div className="admin-games">
          <h2>Games ({games.length})</h2>
          <div className="games-table">
            {games.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Genre</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th>Downloads</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map(game => (
                    <tr key={game.id}>
                      <td>{game.name}</td>
                      <td>{game.genre}</td>
                      <td>{game.type}</td>
                      <td>⭐ {game.rating}</td>
                      <td>📥 {game.downloads}</td>
                      <td>
                        <button className="btn-sm edit" onClick={() => handleEdit(game)}>✏️</button>
                        <button className="btn-sm delete" onClick={() => handleDelete(game.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-games">No games yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
