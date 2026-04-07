import React, { createContext, useContext, useState } from "react"
import type { Language } from "../lib/i18n"

const LANG_KEY = "yro-lang"

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === "en" || stored === "uz") return stored
  } catch {}
  return "en"
}

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en"
    return getInitialLang()
  })

  const setLang = (l: Language) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
