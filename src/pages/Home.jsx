import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Home.css';

/* ==========================================================================
   IMAGES FROM PUBLIC FOLDER (/public/images/...)
   ========================================================================== */

// Hero Section Images
const heroImages = [
  `${import.meta.env.BASE_URL}images/hero1.jpg`,
  `${import.meta.env.BASE_URL}images/hero2.png`,
  `${import.meta.env.BASE_URL}images/hero3.jpg`,
];

// Bento Cover Images
const bentoCategories = [
  { key: 'Thai Foods', size: 'large', cover: `${import.meta.env.BASE_URL}images/food1.jpg` },
  { key: 'Beaches', size: 'small', cover: `${import.meta.env.BASE_URL}images/beach1.jpg` },
  { key: 'Adventures', size: 'small', cover: `${import.meta.env.BASE_URL}images/adv1.jpg` },
  { key: 'Temples', size: 'small', cover: `${import.meta.env.BASE_URL}images/temple1.jpg` },
  { key: 'Palaces', size: 'small', cover: `${import.meta.env.BASE_URL}images/palace1.jpg` },
  { key: 'Festivals', size: 'large', cover: `${import.meta.env.BASE_URL}images/festival1.jpeg` },
];

// Gallery Images
const galleryImageUrls = {
  'Thai Foods': [
    `${import.meta.env.BASE_URL}images/food1.jpg`,
    `${import.meta.env.BASE_URL}images/food2.jpg`,
    `${import.meta.env.BASE_URL}images/food3.jpg`,
    `${import.meta.env.BASE_URL}images/food4.jpg`,
    `${import.meta.env.BASE_URL}images/food5.jpg`,
    `${import.meta.env.BASE_URL}images/food6.jpg`,
    `${import.meta.env.BASE_URL}images/food7.jpg`,
    `${import.meta.env.BASE_URL}images/food8.jpg`,
    `${import.meta.env.BASE_URL}images/food9.jpg`,
    `${import.meta.env.BASE_URL}images/food10.jpg`,
    `${import.meta.env.BASE_URL}images/food11.jpg`,
    `${import.meta.env.BASE_URL}images/food12.jpg`,
    `${import.meta.env.BASE_URL}images/food13.jpg`,
    `${import.meta.env.BASE_URL}images/food14.jpg`,
    `${import.meta.env.BASE_URL}images/food15.jpg`,

  ],
  'Beaches': [
    `${import.meta.env.BASE_URL}images/beach1.jpg`,
    `${import.meta.env.BASE_URL}images/beach2.jpg`,
    `${import.meta.env.BASE_URL}images/beach3.jpg`,
    `${import.meta.env.BASE_URL}images/beach4.jpg`,
    `${import.meta.env.BASE_URL}images/beach5.jpg`,
    `${import.meta.env.BASE_URL}images/beach6.jpg`,
    `${import.meta.env.BASE_URL}images/beach7.jpg`,
  ],
  'Adventures': [
    `${import.meta.env.BASE_URL}images/adv1.jpg`,
    `${import.meta.env.BASE_URL}images/adv2.jpg`,
    `${import.meta.env.BASE_URL}images/adv3.jpg`,
    `${import.meta.env.BASE_URL}images/adv4.jpg`,
    `${import.meta.env.BASE_URL}images/adv5.jpeg`,
  ],
  'Temples': [
    `${import.meta.env.BASE_URL}images/temple1.jpg`,
    `${import.meta.env.BASE_URL}images/temple2.jpg`,
    `${import.meta.env.BASE_URL}images/temple3.jpg`,
    `${import.meta.env.BASE_URL}images/temple4.jpg`,
    `${import.meta.env.BASE_URL}images/temple5.jpg`,
    `${import.meta.env.BASE_URL}images/temple6.jpg`,
    `${import.meta.env.BASE_URL}images/temple7.jpg`,
    `${import.meta.env.BASE_URL}images/temple8.jpg`,
    `${import.meta.env.BASE_URL}images/temple9.jpg`,
    `${import.meta.env.BASE_URL}images/temple10.jpg`,
    `${import.meta.env.BASE_URL}images/temple11.jpg`,
    `${import.meta.env.BASE_URL}images/temple12.jpg`,
    `${import.meta.env.BASE_URL}images/temple13.jpg`,

  ],
  'Palaces': [
    `${import.meta.env.BASE_URL}images/palace1.jpg`,
    `${import.meta.env.BASE_URL}images/palace2.jpg`,
    `${import.meta.env.BASE_URL}images/palace3.jpg`,
  ],
  'Festivals': [
    `${import.meta.env.BASE_URL}images/festival1.jpeg`,
    `${import.meta.env.BASE_URL}images/festival0.jpg`,
    `${import.meta.env.BASE_URL}images/festival2.jpg`,
    `${import.meta.env.BASE_URL}images/festival3.jpg`,
    `${import.meta.env.BASE_URL}images/festival4.jpeg`,
    `${import.meta.env.BASE_URL}images/festival5.jpg`,
    `${import.meta.env.BASE_URL}images/festival6.jpg`,
    `${import.meta.env.BASE_URL}images/festival7.jpg`,
  ],
};

const emptyDestForm = { title: '', price: '', image: '', description: '', rating: '5.0', participants: '', places: '' };

export default function Home() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const h = t.home;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [searchParams, setSearchParams] = useSearchParams();

  // ពេលមកពី Search (Navbar) ជាមួយ ?category=Temples ។ល។ បើកវិចិត្រសាល (gallery)
  // ដែលត្រូវគ្នាភ្លាមៗ ដើម្បីឲ្យលទ្ធផលស្វែងរកនាំទៅកាន់ទីតាំងត្រឹមត្រូវ
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && bentoCategories.some((c) => c.key === category)) {
      setActiveCategory(category);
      setSearchParams({}, { replace: true });
      requestAnimationFrame(() => {
        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [searchParams, setSearchParams]);

  // Firestore-backed packages/products. Falls back to the built-in
  // translated list until an admin adds at least one via Admin > Packages.
  const [firestorePackages, setFirestorePackages] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'packages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => setFirestorePackages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error('Failed to load packages', err);
        setFirestorePackages([]);
      }
    );
    return unsubscribe;
  }, []);

  const packageItems = firestorePackages && firestorePackages.length > 0 ? firestorePackages : h.packages.items;

  // Firestore-backed destinations ("posts")
  const [firestoreDestinations, setFirestoreDestinations] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [destForm, setDestForm] = useState(emptyDestForm);
  const [destStatus, setDestStatus] = useState('idle');

  useEffect(() => {
    const q = query(collection(db, 'destinations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setFirestoreDestinations(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error('Failed to load destinations', err);
        setFirestoreDestinations([]);
      }
    );
    return unsubscribe;
  }, []);

  const usingFallback = !firestoreDestinations || firestoreDestinations.length === 0;
  const destinations = usingFallback ? h.destinations.items : firestoreDestinations;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openGallery = (category) => setActiveCategory(category);
  const closeGallery = () => setActiveCategory(null);

  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setDestStatus('saving');
    try {
      await addDoc(collection(db, 'destinations'), {
        ...destForm,
        isLiked: false,
        galleryImages: destForm.image ? [destForm.image] : [],
        createdAt: serverTimestamp(),
      });
      setDestForm(emptyDestForm);
      setShowAddForm(false);
      setDestStatus('idle');
    } catch (err) {
      console.error(err);
      setDestStatus('error');
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm(h.destinations.deleteConfirm)) return;
    try {
      await deleteDoc(doc(db, 'destinations', id));
    } catch (err) {
      console.error(err);
    }
  };

  const slide = h.heroSlides[currentSlide];

  return (
    <div className="home-page">
      {/* 1. Full Screen Hero Section */}
      <section className="hero">
        <div className="hero__slides">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`hero__slide ${index === currentSlide ? 'hero__slide--active' : ''}`}
            >
              <img src={img} alt={h.heroSlides[index].title} className="hero__img" />
              <div className="hero__overlay" />
            </div>
          ))}
        </div>

        <div className="hero__content">
          <span className="eyebrow eyebrow--badge">
            ✨ {slide.subtitle}
          </span>
          <h1>{slide.title}</h1>
          <p className="hero__sub">{slide.desc}</p>

          <div className="hero__actions">
            <Link to="/services" className="btn btn--primary">
              {h.viewPackages}
            </Link>
            <Link to="/contact" className="btn btn--outline hero__ghost">{h.contactUs}</Link>
          </div>

          <div className="hero__dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`hero__dot ${index === currentSlide ? 'hero__dot--active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Welcome Section */}
      <section className="section container">
        <div className="section-header-left">
          <span className="eyebrow-text">{h.welcome.eyebrow}</span>
          <h2 className="section-title">{h.welcome.title}</h2>
        </div>

        <div className="welcome-grid">
          <div className="welcome__image-wrapper">
            <img
              src={`${import.meta.env.BASE_URL}images/welcome.png`}
              alt="Exploring Cambodia"
              className="welcome__main-img"
            />
            <div className="welcome__badge">
              <span className="badge__icon">⭐ 4.9</span>
              <div className="badge__text">
                <strong>10,000+</strong>
                <small>{h.welcome.badgeTravelers}</small>
              </div>
            </div>
            <div className="welcome__img-backdrop" />
          </div>

          <div className="welcome__content">
            <h3 className="welcome__subheadline">{h.welcome.subheadline}</h3>
            <p className="welcome__desc">{h.welcome.desc}</p>

            <div className="welcome__features">
              <div className="welcome__feature-item">
                <span className="feature__icon">🇰🇭</span>
                <div>
                  <h4>{h.welcome.feature1Title}</h4>
                  <p>{h.welcome.feature1Desc}</p>
                </div>
              </div>

              <div className="welcome__feature-item">
                <span className="feature__icon">🌿</span>
                <div>
                  <h4>{h.welcome.feature2Title}</h4>
                  <p>{h.welcome.feature2Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Experience (Clickable Bento Grid) */}
      <section id="experience" className="section container">
        <span className="eyebrow-text">{h.experience.eyebrow}</span>
        <h2 className="experience-title">{h.experience.title}</h2>

        <div className="bento-container">
          <div className="bento-col">
            <div className="bento-card bento-card--large" onClick={() => openGallery('Thai Foods')}>
              <img src={bentoCategories[0].cover} alt={bentoCategories[0].key} />
              <div className="bento-card__overlay" />
              <div className="bento-card__content">
                <h3>{h.experience.categories['Thai Foods'].label}</h3>
              </div>
            </div>

            <div className="bento-row">
              <div className="bento-card bento-card--small" onClick={() => openGallery('Beaches')}>
                <img src={bentoCategories[1].cover} alt={bentoCategories[1].key} />
                <div className="bento-card__overlay" />
                <div className="bento-card__content">
                  <h3>{h.experience.categories['Beaches'].label}</h3>
                </div>
              </div>

              <div className="bento-card bento-card--small" onClick={() => openGallery('Adventures')}>
                <img src={bentoCategories[2].cover} alt={bentoCategories[2].key} />
                <div className="bento-card__overlay" />
                <div className="bento-card__content">
                  <h3>{h.experience.categories['Adventures'].label}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-col">
            <div className="bento-row">
              <div className="bento-card bento-card--small" onClick={() => openGallery('Temples')}>
                <img src={bentoCategories[3].cover} alt={bentoCategories[3].key} />
                <div className="bento-card__overlay" />
                <div className="bento-card__content">
                  <h3>{h.experience.categories['Temples'].label}</h3>
                </div>
              </div>

              <div className="bento-card bento-card--small" onClick={() => openGallery('Palaces')}>
                <img src={bentoCategories[4].cover} alt={bentoCategories[4].key} />
                <div className="bento-card__overlay" />
                <div className="bento-card__content">
                  <h3>{h.experience.categories['Palaces'].label}</h3>
                </div>
              </div>
            </div>

            <div className="bento-card bento-card--large" onClick={() => openGallery('Festivals')}>
              <img src={bentoCategories[5].cover} alt={bentoCategories[5].key} />
              <div className="bento-card__overlay" />
              <div className="bento-card__content">
                <h3>{h.experience.categories['Festivals'].label}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Destinations Section (Firestore-backed posts) */}
      <section className="section container">
        <div className="section-header-left dest-header">
          <div>
            <span className="eyebrow-text">{h.destinations.eyebrow}</span>
            <h2 className="section-title">{h.destinations.title}</h2>
          </div>

          {isAdmin ? (
            <button type="button" className="btn btn--outline dest-manage-btn" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? h.destinations.cancel : h.destinations.addNew}
            </button>
          ) : (
            <span className="dest-login-hint">{h.destinations.loginToManage}</span>
          )}
        </div>

        {showAddForm && isAdmin && (
          <form className="card dest-add-form" onSubmit={handleAddDestination}>
            <div className="dest-add-form__grid">
              <label>
                {h.destinations.form.title}
                <input required value={destForm.title} onChange={(e) => setDestForm((f) => ({ ...f, title: e.target.value }))} />
              </label>
              <label>
                {h.destinations.form.price}
                <input required value={destForm.price} onChange={(e) => setDestForm((f) => ({ ...f, price: e.target.value }))} />
              </label>
              <label>
                {h.destinations.form.image}
                <input required value={destForm.image} onChange={(e) => setDestForm((f) => ({ ...f, image: e.target.value }))} />
              </label>
              <label>
                {h.destinations.form.rating}
                <input value={destForm.rating} onChange={(e) => setDestForm((f) => ({ ...f, rating: e.target.value }))} />
              </label>
              <label>
                {h.destinations.form.participants}
                <input value={destForm.participants} onChange={(e) => setDestForm((f) => ({ ...f, participants: e.target.value }))} />
              </label>
              <label>
                {h.destinations.form.places}
                <input value={destForm.places} onChange={(e) => setDestForm((f) => ({ ...f, places: e.target.value }))} />
              </label>
            </div>
            <label>
              {h.destinations.form.description}
              <textarea rows={3} value={destForm.description} onChange={(e) => setDestForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <button type="submit" className="btn btn--primary" disabled={destStatus === 'saving'}>
              {destStatus === 'saving' ? h.destinations.saving : h.destinations.save}
            </button>
          </form>
        )}

        <div className="destinations-grid">
          {destinations.map((item) => (
            <div key={item.id} className="dest-card">
              <div className="dest-card__img-wrapper">
                <img src={item.image} alt={item.title} className="dest-card__img" />
                <button
                  className={`dest-card__wishlist ${likedIds.has(item.id) ? 'active' : ''}`}
                  onClick={() => toggleLike(item.id)}
                  aria-label="Save to wishlist"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill={likedIds.has(item.id) ? '#ef4444' : 'rgba(255,255,255,0.7)'}
                    stroke={likedIds.has(item.id) ? '#ef4444' : '#ffffff'}
                    strokeWidth="2"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>

                {isAdmin && !usingFallback && (
                  <button
                    type="button"
                    className="dest-card__delete"
                    onClick={() => handleDeleteDestination(item.id)}
                    aria-label={h.destinations.delete}
                    title={h.destinations.delete}
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="dest-card__body">
                <h3 className="dest-card__title">{item.title}</h3>

                <div className="dest-card__meta">
                  <span className="dest-card__rating">★ {item.rating}</span>
                  <span className="dest-card__participants">👥 {item.participants}</span>
                </div>

                <div className="dest-card__price">
                  <small>{h.destinations.startFrom}</small>
                  <strong>{item.price}</strong>
                </div>

                <div className="dest-card__location">
                  <span className="location-icon">📍</span>
                  <span>{item.places}</span>
                </div>

                <button
                  type="button"
                  className="dest-card__btn-link"
                  onClick={() => setSelectedDeal(item)}
                >
                  {h.destinations.viewDeals}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Packages Section */}
      <section className="section section--jade">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow-text" style={{ color: '#dcece4' }}>{h.packages.eyebrow}</span>
            <h2>{h.packages.title}</h2>
          </div>
          <div className="grid grid--3">
            {packageItems.map((p) => (
              <div className="pkg-card" key={p.id || p.name}>
                {p.badge && <span className="pkg-card__badge">{p.badge}</span>}
                <div className="pkg-card__meta">
                  <span>📅 {p.duration}</span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="pkg-card__price">{p.price} <span>{h.packages.perPerson}</span></div>
                <Link to="/services" className="btn btn--outline btn--full">{h.packages.viewDetails}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Reasons Section */}
      <section className="section container">
        <div className="section-header">
          <span className="eyebrow-text">{h.reasons.eyebrow}</span>
          <h2>{h.reasons.title}</h2>
        </div>
        <div className="grid grid--3 reasons">
          {h.reasons.items.map((r, i) => (
            <div className="reason" key={r.title}>
              <div className="reason__icon-wrap">
                <span className="reason__icon" style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                <span className="reason__num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-header text-center">
            <span className="eyebrow-text" style={{ color: '#dcece4' }}>{h.testimonials.eyebrow}</span>
            <h2>{h.testimonials.title}</h2>
          </div>
          <div className="grid grid--3">
            {h.testimonials.items.map((item) => (
              <blockquote className="testimonial" key={item.name}>
                <div className="testimonial__stars" style={{ color: '#FFB800' }}>
                  {'★'.repeat(item.rating)}
                </div>
                <p>&ldquo;{item.text}&rdquo;</p>
                <cite>— {item.name}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bento Grid Modal Popup Gallery */}
      {activeCategory && h.experience.categories[activeCategory] && (
        <div className="modal-overlay" onClick={closeGallery}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeGallery}>&times;</button>

            <div className="modal-header">
              <h2>{h.experience.categories[activeCategory].title}</h2>
              <p>{h.experience.categories[activeCategory].desc}</p>
            </div>

            <div className="modal-gallery-grid">
              {galleryImageUrls[activeCategory]?.map((url, idx) => (
                <div key={idx} className="modal-gallery-item">
                  <img src={url} alt={h.experience.images[activeCategory][idx]} />
                  <div className="modal-item-title">{h.experience.images[activeCategory][idx]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. View Deal Card Modal Popup */}
      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="deal-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDeal(null)}>&times;</button>

            <div className="deal-modal__hero">
              <img src={selectedDeal.image} alt={selectedDeal.title} />
              <div className="deal-modal__hero-overlay">
                <span className="deal-modal__badge">★ {selectedDeal.rating}</span>
                <h2>{selectedDeal.title}</h2>
              </div>
            </div>

            <div className="deal-modal__body">
              <div className="deal-modal__meta-row">
                <div className="meta-box">
                  <small>{h.dealModal.priceFrom}</small>
                  <strong>{selectedDeal.price}</strong>
                </div>
                <div className="meta-box">
                  <small>{h.dealModal.participants}</small>
                  <span>👥 {selectedDeal.participants}</span>
                </div>
                <div className="meta-box">
                  <small>{h.dealModal.location}</small>
                  <span>📍 {selectedDeal.places}</span>
                </div>
              </div>

              <p className="deal-modal__desc">{selectedDeal.description}</p>

              <h3>{h.dealModal.photosHeading}</h3>
              <div className="deal-modal__gallery">
                {selectedDeal.galleryImages?.map((imgUrl, idx) => (
                  <div key={idx} className="deal-modal__gallery-item">
                    <img src={imgUrl} alt={`${selectedDeal.title} ${idx + 1}`} />
                  </div>
                ))}
              </div>

              <div className="deal-modal__footer">
                <Link to="/contact" className="btn btn--primary btn--full" style={{ justifyContent: 'center' }}>
                  {h.dealModal.bookNow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}