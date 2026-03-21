import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { en, type TranslationKeys } from "./en";
import { th } from "./th";

export type Language = "en" | "th";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
};

const translations: Record<Language, Record<TranslationKeys, string>> = { en, th };

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "employer-dashboard-lang";

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "th" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return "en";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKeys) => translations[language][key] ?? key,
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};