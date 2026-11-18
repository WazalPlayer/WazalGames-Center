import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ShieldCheck, ShieldOff, Users } from 'lucide-react';
import Avatar from '../../components/Avatar';
import { errorMessage } from '../../services/errors';
import { ADMIN_EMAIL } from '../../services/admin';

export default function UsersAdmin({ setError }) {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err)));
  }, []);

  const toggleRole = async (u) => {
    try {
      await updateDoc(doc(db, 'users', u.id), { role: u.role === 'admin' ? 'user' : 'admin' });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (users.length === 0) {
    return (
      <div className="empty">
        <Users size={32} />
        <p>Пользователей пока нет.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Пользователь</th><th>Email</th><th>Роль</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isOwner = u.email === ADMIN_EMAIL;
            return (
              <tr key={u.id}>
                <td>
                  <div className="person">
                    <Avatar src={u.avatar} name={u.username} size={32} />
                    <strong>{u.username || '—'}</strong>
                  </div>
                </td>
                <td className="muted">{u.email || '—'}</td>
                <td>
                  <span className={`role-badge ${u.role === 'admin' || isOwner ? 'admin' : ''}`}>
                    {isOwner ? 'Владелец' : u.role === 'admin' ? 'Администратор' : 'Игрок'}
                  </span>
                </td>
                <td className="actions">
                  {!isOwner && (
                    <button className="btn btn-sm" onClick={() => toggleRole(u)}>
                      {u.role === 'admin' ? <><ShieldOff size={14} /> Снять роль</> : <><ShieldCheck size={14} /> Сделать админом</>}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
