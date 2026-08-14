import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'km';
    } catch {
      return 'km';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => setLangState(l);
  const toggleLang = () => setLangState((l) => (l === 'km' ? 'en' : 'km'));

  // t = the full translation tree for the current language.
  // Every page/component reads its strings from here so a single click
  // on the language switcher changes the whole site at once.
  const t = useMemo(() => translations[lang], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside a LanguageProvider');
  return ctx;
}
