import { useEffect, useState } from 'react';
import { Trash2, Mail, MailOpen } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

export default function Messages() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setItems([]));
    return unsub;
  }, []);

  const filtered = (items || []).filter((m) =>
    (m.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleRead = async (m) => {
    setError('');
    try {
      await updateDoc(doc(db, 'messages', m.id), { read: !m.read });
    } catch (err) {
      console.error(err);
      setError(err.code === 'permission-denied'
        ? "Permission denied — your account may not have admin rights, or firestore.rules hasn't been deployed yet."
        : 'Could not update this message. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    setError('');
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.error(err);
      setError(err.code === 'permission-denied'
        ? "Permission denied — your account may not have admin rights, or firestore.rules hasn't been deployed yet."
        : 'Could not delete this message. Please try again.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Messages</h1>
          <p>Submissions from the Contact page form.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search messages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {items === null && <p className="admin-empty">Loading…</p>}
      {items !== null && filtered.length === 0 && <p className="admin-empty">No messages yet.</p>}
      {error && <p className="admin-error-text">{error}</p>}

      {filtered.map((m) => (
        <div className={`admin-message-card ${!m.read ? 'admin-message-card--unread' : ''}`} key={m.id}>
          <div className="admin-message-card__head">
            <div>
              <div className="admin-cell-title">{m.fullName || 'Unknown'}</div>
              <div className="admin-cell-sub">{m.email} {m.phone ? `· ${m.phone}` : ''}</div>
            </div>
            <span className={`admin-badge admin-badge--${m.read ? 'read' : 'unread'}`}>
              {m.read ? 'Read' : 'New'}
            </span>
          </div>
          <p className="admin-message-card__body">{m.message}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="admin-message-card__meta">{formatDate(m.createdAt)}</span>
            <div className="admin-table__actions">
              <button className="admin-btn admin-btn--outline admin-btn--icon" onClick={() => toggleRead(m)} aria-label="Toggle read">
                {m.read ? <Mail size={15} /> : <MailOpen size={15} />}
              </button>
              <button className="admin-btn admin-btn--danger admin-btn--icon" onClick={() => handleDelete(m.id)} aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
