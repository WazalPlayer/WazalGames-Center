import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ProfilePage.css';

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [gameAccounts, setGameAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          setGameAccounts(data.gameAccounts || {});
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <Navbar onLogout={handleLogout} />

      <div className="container">
        <h1>My Profile</h1>

        {userProfile && (
          <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
              <img src={userProfile.avatar} alt="Avatar" className="profile-avatar" />
              <div className="profile-info">
                <h2>{userProfile.username}</h2>
                <p>{userProfile.email}</p>
                <p className="bio">{userProfile.bio || 'No bio yet'}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat">
                <strong>{userProfile.stats?.gamesDownloaded || 0}</strong>
                <span>Games Downloaded</span>
              </div>
              <div className="stat">
                <strong>{userProfile.stats?.gamesPlayed || 0}</strong>
                <span>Games Played</span>
              </div>
              <div className="stat">
                <strong>{Math.round((userProfile.stats?.playtime || 0) / 60)}h</strong>
                <span>Total Playtime</span>
              </div>
            </div>

            {/* Game Accounts */}
            <section className="game-accounts">
              <h3>Game Accounts</h3>
              <div className="accounts-list">
                {Object.keys(gameAccounts).length > 0 ? (
                  Object.entries(gameAccounts).map(([game, account]) => (
                    <div key={game} className="account-item">
                      <h4>{game}</h4>
                      <p>Username: {account.username}</p>
                      <button className="btn btn-sm">Edit</button>
                    </div>
                  ))
                ) : (
                  <p>No game accounts linked yet</p>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <div className="profile-actions">
              <button className="btn btn-secondary">Edit Profile</button>
              <button className="btn btn-secondary">Change Password</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
