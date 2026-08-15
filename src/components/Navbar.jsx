import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import TowerSkyline from './TowerSkyline';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/* --- 1. LOGIN MODAL COMPONENT --- */
function LoginModal({ isOpen, onClose, onSwitchToSignup, onForgotPassword }) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await login(formData.email, formData.password);
      setStatus('idle');
      setFormData({ email: '', password: '', rememberMe: false });
      onClose();
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError(t.auth.genericError);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <h2 className="modal-title">{t.auth.loginTitle}</h2>
        <p className="modal-subtitle">{t.auth.loginSubtitle}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <input
              type="email"
              placeholder={t.auth.email}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <span className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.password}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <span className="input-icon toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          <div className="checkbox-container" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
            <label className="checkbox-container" style={{ width: 'auto' }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span className="checkmark"></span>
              {t.auth.rememberMe}
            </label>
            <button type="button" className="auth-switch-link" onClick={onForgotPassword}>
              {t.auth.forgotPasswordLink}
            </button>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" className="login-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? t.auth.loggingIn : t.auth.loginBtn}
          </button>

          <p className="modal-footer">
            {t.auth.noAccount}{' '}
            <button type="button" className="auth-switch-link" onClick={onSwitchToSignup}>
              {t.auth.signupLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

/* --- FORGOT PASSWORD MODAL COMPONENT --- */
function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }) {
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await resetPassword(email);
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError(t.auth.genericError);
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus('idle');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>&times;</button>

        <h2 className="modal-title">{t.auth.forgotTitle}</h2>
        <p className="modal-subtitle">{t.auth.forgotSubtitle}</p>

        {status === 'sent' ? (
          <p className="modal-success" style={{ color: 'var(--saffron)', fontWeight: 600 }}>
            {t.auth.resetLinkSent}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <input
                type="email"
                placeholder={t.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <button type="submit" className="login-submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? t.auth.sendingResetLink : t.auth.sendResetLink}
            </button>
          </form>
        )}

        <p className="modal-footer">
          <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
            {t.auth.backToLogin}
          </button>
        </p>
      </div>
    </div>
  );
}

/* --- 2. SIGNUP MODAL COMPONENT --- */
function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await signup(formData.username, formData.email, formData.password);
      setStatus('idle');
      setFormData({ username: '', email: '', password: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError(t.auth.genericError);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <h2 className="modal-title">{t.auth.signupTitle}</h2>
        <p className="modal-subtitle">{t.auth.signupSubtitle}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <input
              type="text"
              placeholder={t.auth.username}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <span className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder={t.auth.email}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <span className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.password}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
            <span className="input-icon toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" className="login-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? t.auth.signingUp : t.auth.signupBtn}
          </button>

          <p className="modal-footer">
            {t.auth.haveAccount}{' '}
            <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
              {t.auth.loginLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

/* --- 3. MAIN NAVBAR COMPONENT --- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const [langDropdown, setLangDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  // States សម្រាប់ Search Modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/services', label: t.nav.services },
    { to: '/contact', label: t.nav.contact },
  ];

  // បញ្ជីទិន្នន័យពេញលេញសម្រាប់ស្វែងរក (ទំព័រ, រមណីដ្ឋាន, និងអាហារ)
  // ចំណាំ៖ ទីតាំង/អាហារនីមួយៗភ្ជាប់ទៅកាន់ប្រភេទ (category) ជាក់លាក់នៅទំព័រដើម
  // តាមរយៈ ?category= ដើម្បីឲ្យលទ្ធផលស្វែងរកនាំទៅកាន់ទីតាំងត្រឹមត្រូវ
  const st = t.nav.searchModal.types;
  const searchItems = [
    { title: t.nav.home, path: '/', type: st.page },
    { title: t.nav.about, path: '/about', type: st.page },
    { title: t.nav.services, path: '/services', type: st.page },
    { title: t.nav.contact, path: '/contact', type: st.page },
    { title: 'ប្រាសាទអង្គរវត្ត (Angkor Wat)', path: '/?category=Temples', type: st.location },
    { title: 'តំបន់ទេសចរណ៍ធម្មជាតិ (Nature & Mountains)', path: '/?category=Adventures', type: st.location },
    { title: 'ឆ្នេរសមុទ្រ និងកោះ (Beaches & Islands)', path: '/?category=Beaches', type: st.location },
    { title: 'អាហារប្រពៃណីខ្មែរ (Khmer Foods)', path: '/?category=Thai Foods', type: st.food },
    { title: 'អាហារពេលល្ងាចតាមឆ្នេរ (Beach Dinner)', path: '/?category=Beaches', type: st.food },
    { title: 'កញ្ចប់ដំណើរកម្សាន្ត VIP', path: '/services#booking', type: st.package },
  ];

  const filteredResults = searchItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    if (window.confirm(t.auth.logoutConfirm)) {
      await logout();
    }
  };

  return (
    <>
      <header className="nav">
        <div className="container nav__bar">
          {/* Logo */}
          <NavLink to="/" className="nav__logo" onClick={() => setOpen(false)}>
            <TowerSkyline variant="mark" color="var(--saffron)" />
            <span>WanderGo</span>
          </NavLink>

          {/* Mobile Toggle */}
          <button
            className="nav__toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /> <span /> <span />
          </button>

          {/* Menu */}
          <nav className={`nav__menu ${open ? 'is-open' : ''}`}>
            <div className="nav__links">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="nav__actions">
              {/* ប៊ូតុង Search */}
              <button 
                className="nav__icon-btn" 
                aria-label={t.nav.search}
                onClick={() => setShowSearchModal(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Login / Account */}
              {isLoggedIn ? (
                <div className="nav__account">
                  <span className="nav__account-name" title={user?.email}>
                    {t.nav.hello}, {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                  <NavLink to="/admin" className="nav__icon-btn" aria-label={t.auth.dashboard} title={t.auth.dashboard} onClick={() => setOpen(false)}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </NavLink>
                  <button type="button" className="nav__icon-btn" aria-label={t.nav.logout} onClick={handleLogout} title={t.nav.logout}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="nav__icon-btn"
                  aria-label={t.nav.login}
                  title={t.nav.login}
                  onClick={() => {
                    setShowLoginModal(true);
                    setOpen(false);
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              )}

              <div className="nav__lang-dropdown">
                <button
                  className="nav__lang-trigger"
                  onClick={() => setLangDropdown(!langDropdown)}
                >
                  <span>{t.nav.langLabel}</span>
                  <svg className={`nav__arrow ${langDropdown ? 'is-active' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {langDropdown && (
                  <div className="nav__lang-menu">
                    <button onClick={() => { setLang('en'); setLangDropdown(false); }} className={lang === 'en' ? 'is-active' : ''}>English (En)</button>
                    <button onClick={() => { setLang('km'); setLangDropdown(false); }} className={lang === 'km' ? 'is-active' : ''}>ភាសាខ្មែរ (Kh)</button>
                  </div>
                )}
              </div>

              <NavLink to="/services" className="btn btn--primary nav__cta" onClick={() => setOpen(false)}>
                {t.nav.cta}
              </NavLink>
            </div>
          </nav>
        </div>
      </header>

      {/* --- Search Modal Popup --- */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSearchModal(false)}>&times;</button>
            
            <h2 className="modal-title">{t.nav.searchModal.title}</h2>
            <p className="modal-subtitle">{t.nav.searchModal.subtitle}</p>

            <div className="modal-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder={t.nav.searchModal.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* បង្ហាញលទ្ធផលស្វែងរក */}
              <div className="search-results-list" style={{ marginTop: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        setShowSearchModal(false);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      <span>{item.title}</span>
                      <small style={{ opacity: 0.7, fontSize: '0.75rem', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.type}
                      </small>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#fff', fontSize: '0.85rem', marginTop: '10px' }}>
                    {t.nav.searchModal.noResults}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => { setShowLoginModal(false); setShowSignupModal(true); }}
        onForgotPassword={() => { setShowLoginModal(false); setShowForgotModal(true); }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => { setShowSignupModal(false); setShowLoginModal(true); }}
      />

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSwitchToLogin={() => { setShowForgotModal(false); setShowLoginModal(true); }}
      />
    </>
  );
}