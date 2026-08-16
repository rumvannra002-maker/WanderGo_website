import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsub;
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setItems([]));
    } catch (err) {
      console.error(err);
      setItems([]);
    }
    return () => unsub && unsub();
  }, []);

  const filtered = (items || []).filter((u) =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const isLastAdmin = (u) =>
    u.role === 'admin' && (items || []).filter((i) => i.role === 'admin').length <= 1;

  const handleRoleChange = async (u, nextRole) => {
    if (nextRole === u.role) return;
    if (u.role === 'admin' && nextRole !== 'admin' && isLastAdmin(u)) {
      setError('Cannot remove the last remaining admin — promote someone else first.');
      return;
    }
    setError('');
    setBusyId(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), { role: nextRole });
    } catch (err) {
      console.error(err);
      setError("Could not update this user's role. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u) => {
    if (u.role === 'admin' && isLastAdmin(u)) {
      setError('Cannot remove the last remaining admin — promote someone else first.');
      return;
    }
    if (!window.confirm(`Remove ${u.username || u.email} from the dashboard? This deletes their profile record and revokes access; their sign-in account itself isn't deleted.`)) return;
    setError('');
    setBusyId(u.id);
    try {
      await deleteDoc(doc(db, 'users', u.id));
    } catch (err) {
      console.error(err);
      setError('Could not remove this user. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p>Everyone who has signed up. Only <strong>admin</strong> accounts can reach this dashboard — promote a trusted user to Admin, or demote/remove an account below.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={5} className="admin-empty">Loading…</td></tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No users found.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="admin-cell-title">
                  {u.username || '—'}
                  {u.id === currentUser?.uid && <span className="admin-cell-sub"> (you)</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="admin-role-select"
                    value={u.role || 'user'}
                    disabled={busyId === u.id}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                </td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <div className="admin-table__actions">
                    <button
                      className="admin-btn admin-btn--danger"
                      disabled={busyId === u.id}
                      onClick={() => handleDelete(u)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
