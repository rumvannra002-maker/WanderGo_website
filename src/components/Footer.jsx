import { Link } from 'react-router-dom';
import TowerSkyline from './TowerSkyline';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <TowerSkyline variant="divider" color="var(--jade)" />
      <div className="footer__body">
        <div className="container footer__grid">
          <div>
            <div className="footer__logo">
              <TowerSkyline variant="mark" color="var(--saffron)" />
              <span>WanderGo</span>
            </div>
            <p>{t.footer.tagline}</p>
          </div>

          <div>
            <h3>{t.footer.linksHeading}</h3>
            <ul className="footer__list">
              <li><Link to="/">{t.nav.home}</Link></li>
              <li><Link to="/about">{t.nav.about}</Link></li>
              <li><Link to="/services">{t.nav.services}</Link></li>
              <li><Link to="/contact">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h3>{t.footer.contactHeading}</h3>
            <ul className="footer__list">
              <li>{t.footer.address}</li>
              <li>{t.footer.phone}</li>
              <li>{t.footer.email}</li>
              <li>{t.footer.hours}</li>
            </ul>
          </div>

          <div>
            <h3>{t.footer.socialHeading}</h3>
            <div className="footer__social">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="TikTok">TikTok</a>
              <a href="#" aria-label="Telegram">Telegram</a>
            </div>
          </div>
        </div>

        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} WanderGo (Angkor Trails). {t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
