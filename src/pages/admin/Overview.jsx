import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString();
}

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Overview() {
  const [destinations, setDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'destinations'), orderBy('createdAt', 'desc')), (s) =>
        setDestinations(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (s) =>
        setBookings(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (s) =>
        setMessages(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(collection(db, 'users'), (s) =>
        setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const pendingBookings = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
  const unreadMessages = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>A snapshot of Angkor Trails activity, live from Firestore.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Destinations</div>
          <div className="admin-stat-card__value">{destinations.length}</div>
          <div className="admin-stat-card__hint">Live on the site</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Pending Bookings</div>
          <div className="admin-stat-card__value is-warn">{pendingBookings}</div>
          <div className="admin-stat-card__hint">{bookings.length} total bookings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Unread Messages</div>
          <div className="admin-stat-card__value is-rose">{unreadMessages}</div>
          <div className="admin-stat-card__hint">{messages.length} total messages</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Registered Users</div>
          <div className="admin-stat-card__value is-accent">{users.length}</div>
          <div className="admin-stat-card__hint">Signed-in admins</div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <div className="admin-panel__head">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="admin-panel__link">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="admin-empty">No bookings yet.</p>
          ) : (
            bookings.slice(0, 5).map((b) => (
              <div className="admin-list-row" key={b.id}>
                <div>
                  <div className="admin-list-row__title">{b.name || 'Unnamed'}</div>
                  <div className="admin-list-row__meta">{b.packageName} · {formatDate(b.createdAt)}</div>
                </div>
                <span className={`admin-badge admin-badge--${b.status || 'pending'}`}>
                  {STATUS_LABEL[b.status] || 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel__head">
            <h2>Messages</h2>
            <Link to="/admin/messages" className="admin-panel__link">View all</Link>
          </div>
          {messages.length === 0 ? (
            <p className="admin-empty">No messages yet.</p>
          ) : (
            messages.slice(0, 5).map((m) => (
              <div className="admin-list-row" key={m.id}>
                <div>
                  <div className="admin-list-row__title">{m.fullName || 'Unknown'}</div>
                  <div className="admin-list-row__meta">{formatDate(m.createdAt)}</div>
                </div>
                <span className={`admin-badge admin-badge--${m.read ? 'read' : 'unread'}`}>
                  {m.read ? 'Read' : 'New'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
