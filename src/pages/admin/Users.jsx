import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

export default function Users() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');

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

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p>Everyone who has signed up — every account can manage content (see README for role plans).</p>
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={4} className="admin-empty">Loading…</td></tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">No users found.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="admin-cell-title">{u.username || '—'}</td>
                <td>{u.email}</td>
                <td><span className="admin-badge admin-badge--confirmed">{u.role || 'admin'}</span></td>
                <td>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
