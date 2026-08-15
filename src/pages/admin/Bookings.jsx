import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Bookings() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setItems([]));
    return unsub;
  }, []);

  const filtered = (items || []).filter((b) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.packageName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (id, statusValue) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: statusValue });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Bookings</h1>
          <p>Requests submitted through the Services page booking form.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search by name or package…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Package</th>
              <th>Preferred Date</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={6} className="admin-empty">Loading…</td></tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No bookings yet.</td></tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="admin-cell-title">{b.name || 'Unnamed'}</div>
                  <div className="admin-cell-sub">{b.phone}</div>
                </td>
                <td>{b.packageName || '—'}</td>
                <td>{b.date || '—'}</td>
                <td>{formatDate(b.createdAt)}</td>
                <td>
                  <select
                    className="admin-status-select"
                    value={b.status || 'pending'}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn admin-btn--danger admin-btn--icon" onClick={() => handleDelete(b.id)} aria-label="Delete">
                      <Trash2 size={15} />
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
