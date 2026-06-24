// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { I18nManager } from 'react-native';
import { Language, translations, TranslationKey } from '@/constants/i18n';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const isRTL = language === 'ar';

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ language, isRTL, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
