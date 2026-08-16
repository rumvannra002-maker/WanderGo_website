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

// Manages the "Popular Packages" (products) shown on the Home page.
// Falls back to the built-in translated packages until an admin adds at
// least one here — see src/pages/Home.jsx.
const emptyForm = { name: '', duration: '', price: '', desc: '', badge: '' };

export default function Packages() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'packages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setItems([])
    );
    return unsub;
  }, []);

  const filtered = (items || []).filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
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
      name: item.name || '',
      duration: item.duration || '',
      price: item.price || '',
      desc: item.desc || '',
      badge: item.badge || '',
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
        await updateDoc(doc(db, 'packages', editingId), { ...form });
      } else {
        await addDoc(collection(db, 'packages'), {
          ...form,
          createdAt: serverTimestamp(),
        });
      }
      setStatus('idle');
      closeModal();
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError(err.code === 'permission-denied'
        ? "Permission denied — your account may not have admin rights, or firestore.rules hasn't been deployed yet."
        : 'Could not save this package. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package? This cannot be undone.')) return;
    setListError('');
    try {
      await deleteDoc(doc(db, 'packages', id));
    } catch (err) {
      console.error(err);
      setListError(err.code === 'permission-denied'
        ? "Permission denied — your account may not have admin rights, or firestore.rules hasn't been deployed yet."
        : 'Could not delete this package. Please try again.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Packages</h1>
          <p>Manage the tour packages shown in the Home page's "Popular Packages" section.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search packages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openAdd}>
          <Plus size={16} /> Add Package
        </button>
      </div>

      {listError && <p className="admin-error-text">{listError}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Badge</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={5} className="admin-empty">Loading…</td></tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No packages found. The Home page will show the default packages until you add one here.</td></tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="admin-cell-title">{item.name}</div>
                  <div className="admin-cell-sub">{item.desc}</div>
                </td>
                <td>{item.duration}</td>
                <td>{item.price}</td>
                <td>{item.badge || '—'}</td>
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
            <h2>{editingId ? 'Edit Package' : 'Add Package'}</h2>

            {error && <p className="admin-error-text">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-field admin-form-grid--full">
                  <label>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="admin-field">
                  <label>Duration</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 days / 2 nights" required />
                </div>
                <div className="admin-field">
                  <label>Price</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$199" required />
                </div>
                <div className="admin-field">
                  <label>Badge (optional)</label>
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Best Seller" />
                </div>
                <div className="admin-field admin-form-grid--full">
                  <label>Description</label>
                  <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={status === 'saving'}>
                  {status === 'saving' ? 'Saving…' : editingId ? 'Save Changes' : 'Add Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
