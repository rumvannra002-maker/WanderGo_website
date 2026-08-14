import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

export default function Contact() {
  const { t } = useLanguage();
  const c = t.contact;
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await addDoc(collection(db, 'messages'), { ...form, createdAt: serverTimestamp() });
      setStatus('success');
      setForm({ fullName: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero__media">
          <img src="images/123.png" alt="Contact Hero" />
          <div className="contact-hero__overlay"></div>
        </div>
        <div className="container contact-hero__content">
          <span className="eyebrow" style={{ color: 'var(--sandstone, #d4b28c)' }}>
            {c.hero.eyebrow}
          </span>
          <h1>{c.hero.title}</h1>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="section container contact-grid">
        <form className="card contact-form" onSubmit={handleSubmit}>
          <h2>{c.form.title}</h2>

          <label>
            {c.form.fullName}
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder={c.form.fullNamePlaceholder}
            />
          </label>

          <label>
            {c.form.email}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            {c.form.phone}
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={c.form.phonePlaceholder}
            />
          </label>

          <label>
            {c.form.message}
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              placeholder={c.form.messagePlaceholder}
            />
          </label>

          <button type="submit" className="btn btn--primary btn--full" disabled={status === 'saving'}>
            {status === 'saving' ? c.form.submitting : c.form.submit}
          </button>

          {status === 'success' && (
            <p className="contact-msg is-success">{c.form.success}</p>
          )}
          {status === 'error' && (
            <p className="contact-msg is-error">{c.form.error}</p>
          )}
        </form>

        <div className="contact-info">
          <div className="info-block">
            <h3>{c.info.addressTitle}</h3>
            <p>{c.info.address}</p>
          </div>

          <div className="info-block">
            <h3>{c.info.phoneTitle}</h3>
            <p>{c.info.phone}</p>
          </div>

          <div className="info-block">
            <h3>{c.info.emailTitle}</h3>
            <p>{c.info.email}</p>
          </div>

          <div className="info-block">
            <h3>{c.info.hoursTitle}</h3>
            <p>
              {c.info.hoursLine1}<br />
              {c.info.hoursLine2}
            </p>
          </div>

          <div className="info-block">
            <h3>{c.info.socialTitle}</h3>
            <div className="info-social">
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">TikTok</a>
              <a href="#">Telegram</a>
            </div>
          </div>

          <div className="map-frame">
            <iframe
              title={c.mapTitle}
              src="https://www.google.com/maps?q=Phnom%20Penh%2C%20Cambodia&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}