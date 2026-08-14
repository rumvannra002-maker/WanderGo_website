import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './About.css';

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const a = t.about;

  const handleBookTrip = () => {
    navigate('/services');
  };

  return (
    <div className="fly-app">
      {/* 1. HERO SECTION */}
      <section 
        className="hero-section"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero_about.png)` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>{a.hero.titleLine1}<br /><span>{a.hero.titleLine2}</span></h1>
            <p>{a.hero.desc}</p>

            <button className="btn-gold-border" onClick={handleBookTrip}>
              {a.hero.cta}
            </button>
          </div>

          <div className="hero-cards">
            <div className="top-card">
              <span className="card-badge">7.6 ★</span>
              <img src={`${import.meta.env.BASE_URL}images/images1.jpg`} alt="Iceland" />
              <div className="card-details">
                <small>{a.hero.card1Place}</small>
                <h4>{a.hero.card1Title}</h4>
              </div>
            </div>

            <div className="top-card">
              <span className="card-badge">8.5 ★</span>
              <img src={`${import.meta.env.BASE_URL}images/images3.jpg`} alt="Hawaii" />
              <div className="card-details">
                <small>{a.hero.card2Place}</small>
                <h4>{a.hero.card2Title}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE SECTION */}
      <section className="middle-section">
        <div className="middle-container">

          <div className="middle-left">
            <div className="stats-header">

              <div className="stat-column">
                <div className="stat-icon"></div>
                <div className="stat-label">{a.stats[0].label}</div>
                <div className="stat-val">{a.stats[0].value}</div>
              </div>

              <div className="stat-column">
                <div className="stat-icon"></div>
                <div className="stat-label">{a.stats[1].label}</div>
                <div className="stat-val">{a.stats[1].value}</div>
              </div>

              <div className="stat-column">
                <div className="stat-icon"></div>
                <div className="stat-label">{a.stats[2].label}</div>
                <div className="stat-val">{a.stats[2].value}</div>
              </div>

            </div>

            <p className="description-text">{a.desc1}</p>
            <p className="description-text">{a.desc2}</p>

            <div className="badges-row">
              <div className="mini-icons"></div>

              <Link to="/services" className="learn-more-btn">
                {a.learnMore} <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="photo-stack">
            <div className="tilted-card card-1">
              <img src={`${import.meta.env.BASE_URL}images/ភ្នំវល្លិ៍.jpg`} alt="Mountain" />
            </div>
            <div className="tilted-card card-2">
              <img src={`${import.meta.env.BASE_URL}images/temple1.jpg`} alt="Beach" />
            </div>
            <div className="tilted-card card-3">
              <img src={`${import.meta.env.BASE_URL}images/images2.jpg`} alt="Machu Picchu" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. ABOUT US SECTION */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-frame">
            <img src={`${import.meta.env.BASE_URL}images/12.jpg`} alt="Office Space" />
          </div>

          <div className="about-right">
            <h2>{a.aboutUsTitle}</h2>
            <p>{a.aboutP1}</p>
            <p>{a.aboutP2}</p>
          </div>
        </div>
      </section>
    </div>
  );
}