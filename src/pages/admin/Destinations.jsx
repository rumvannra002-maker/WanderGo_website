import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

const emptyForm = { title: '', price: '', image: '', description: '', rating: '5.0', participants: '', places: '' };

export default function Destinations() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'destinations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setItems([])
    );
    return unsub;
  }, []);

  const filtered = (items || []).filter((d) =>
    (d.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      price: item.price || '',
      image: item.image || '',
      description: item.description || '',
      rating: item.rating || '5.0',
      participants: item.participants || '',
      places: item.places || '',
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setError('');
    try {
      if (editingId) {
        await updateDoc(doc(db, 'destinations', editingId), { ...form });
      } else {
        await addDoc(collection(db, 'destinations'), {
          ...form,
          isLiked: false,
          galleryImages: form.image ? [form.image] : [],
          createdAt: serverTimestamp(),
        });
      }
      setStatus('idle');
      closeModal();
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError('Could not save this destination. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'destinations', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Destinations</h1>
          <p>Manage the "Popular Destinations" shown on the Home page.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search destinations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openAdd}>
          <Plus size={16} /> Add Destination
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Destination</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Participants</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={5} className="admin-empty">Loading…</td></tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No destinations found.</td></tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.image && <img className="admin-table__thumb" src={item.image} alt="" />}
                    <div>
                      <div className="admin-cell-title">{item.title}</div>
                      <div className="admin-cell-sub">{item.places}</div>
                    </div>
                  </div>
                </td>
                <td>{item.price}</td>
                <td>{item.rating}</td>
                <td>{item.participants}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn admin-btn--outline admin-btn--icon" onClick={() => openEdit(item)} aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button className="admin-btn admin-btn--danger admin-btn--icon" onClick={() => handleDelete(item.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={closeModal}>&times;</button>
            <h2>{editingId ? 'Edit Destination' : 'Add Destination'}</h2>

            {error && <p className="admin-error-text">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-field admin-form-grid--full">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="admin-field admin-form-grid--full">
                  <label>Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="images/temple1.jpg" required />
                </div>
                <div className="admin-field">
                  <label>Price</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$120" required />
                </div>
                <div className="admin-field">
                  <label>Rating</label>
                  <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="5.0" />
                </div>
                <div className="admin-field">
                  <label>Participants</label>
                  <input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} placeholder="12+ joined" />
                </div>
                <div className="admin-field">
                  <label>Places</label>
                  <input value={form.places} onChange={(e) => setForm({ ...form, places: e.target.value })} placeholder="Siem Reap" />
                </div>
                <div className="admin-field admin-form-grid--full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={status === 'saving'}>
                  {status === 'saving' ? 'Saving…' : editingId ? 'Save Changes' : 'Add Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
