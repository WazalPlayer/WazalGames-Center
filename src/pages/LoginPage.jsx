import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Gamepad2, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { errorMessage } from '../services/errors';

const emptyProfile = (username) => ({
  username,
  avatar: '',
  bio: '',
  role: 'user',
  gameAccounts: {},
  friends: [],
  blockedUsers: [],
  stats: { gamesDownloaded: 0, gamesPlayed: 0, playtime: 0 },
});

function LoginPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          ...emptyProfile(email.split('@')[0]),
          email,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          ...emptyProfile(result.user.displayName || result.user.email.split('@')[0]),
          email: result.user.email,
          avatar: result.user.photoURL || '',
          createdAt: new Date(),
        },
        { merge: true },
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <Gamepad2 size={28} />
          <h1>WazalGames Center</h1>
        </div>
        <p className="sub">Войдите, чтобы скачивать и запускать игры</p>

        <div className="segmented">
          <button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Вход</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Регистрация</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleEmail}>
          <div className="field">
            <label>Email</label>
            <div className="input-icon">
              <Mail size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label>Пароль</label>
            <div className="input-icon">
              <Lock size={16} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Подождите...' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="divider">или</div>

        <button className="btn btn-block" onClick={handleGoogle} disabled={loading}>
          Войти через Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
