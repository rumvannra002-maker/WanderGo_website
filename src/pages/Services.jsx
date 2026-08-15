import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import './Services.css';

// Icons for each service, matched by index to the translated list in i18n/translations.js
const serviceIcons = [
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>,
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>,
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>,
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>,
];

export default function Services() {
  const { t } = useLanguage();
  const s = t.services;
  const pricing = s.pricing.plans;

  const [form, setForm] = useState({ name: '', phone: '', packageName: pricing[0].name, date: '' });
  const [status, setStatus] = useState('idle');
  const location = useLocation();

  // React Router មិនអូសទៅកាន់ #hash ដោយស្វ័យប្រវត្តិទេ (ដូចជា #booking ពី Search)
  // ដូច្នេះត្រូវអូសទៅដោយដៃពេលមកដល់ទំព័រនេះជាមួយ hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await addDoc(collection(db, 'bookings'), {
        ...form,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setForm({ name: '', phone: '', packageName: pricing[0].name, date: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <section className="services-hero">
        <div className="services-hero__media">
          <img src="images/a.jpg" alt="Hero Background" />
          <div className="services-hero__overlay"></div>
        </div>
        <div className="container services-hero__content">
          <span className="eyebrow" style={{ color: 'var(--sandstone)' }}>{s.hero.eyebrow}</span>
          <h1>{s.hero.title}</h1>
        </div>
      </section>

      <section className="section container">
        <div className="grid grid--3">
          {s.list.map((item, i) => (
            <div className="service-card" key={item.title}>
              <div className="service-icon">{serviceIcons[i]}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--jade">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--sandstone)' }}>{s.pricing.eyebrow}</span>
          <h2>{s.pricing.title}</h2>
          <div className="grid grid--3 pricing-grid">
            {pricing.map((p) => (
              <div className={`price-card ${p.featured ? 'is-featured' : ''}`} key={p.name}>
                {p.featured && <span className="price-card__badge">{s.pricing.mostPopular}</span>}
                <h3>{p.name}</h3>
                <div className="price-card__price">{p.price}</div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <span style={{ color: p.featured ? 'var(--jade)' : 'var(--saffron)', fontWeight: 'bold' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#booking" className="btn btn--primary btn--full">{s.pricing.bookNow}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="section container booking">
        <div className="booking__intro">
          <span className="eyebrow">{s.booking.eyebrow}</span>
          <h2>{s.booking.title}</h2>
          <p>{s.booking.desc}</p>
        </div>

        <form className="booking__form" onSubmit={handleSubmit}>
          <label>
            {s.booking.name}
            <input name="name" value={form.name} onChange={handleChange} required placeholder={s.booking.namePlaceholder} />
          </label>
          <label>
            {s.booking.phone}
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder={s.booking.phonePlaceholder} />
          </label>
          <label>
            {s.booking.packageLabel}
            <select name="packageName" value={form.packageName} onChange={handleChange}>
              {pricing.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </label>
          <label>
            {s.booking.date}
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>

          <button type="submit" className="btn btn--primary btn--full" disabled={status === 'saving'}>
            {status === 'saving' ? s.booking.submitting : s.booking.submit}
          </button>

          {status === 'success' && <p className="booking__msg is-success">{s.booking.success}</p>}
          {status === 'error' && <p className="booking__msg is-error">{s.booking.error}</p>}
        </form>
      </section>
    </>
  );
}