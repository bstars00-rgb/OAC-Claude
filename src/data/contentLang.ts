// Module-level "content language" so the data accessors can return localized
// copies without every call site passing a language. The LanguageProvider sets
// this synchronously on each render (before descendants render), and components
// that consume the language context re-render on change.

export type ContentLang = 'en' | 'ko'

let CURRENT: ContentLang = 'en'

export const setContentLang = (l: ContentLang) => {
  CURRENT = l
}

export const getContentLang = (): ContentLang => CURRENT

// Pick a localized value: returns `ko` when the content language is Korean and a
// Korean value exists, otherwise the English fallback.
export function pick<T>(en: T, ko: T | undefined): T {
  return CURRENT === 'ko' && ko !== undefined ? ko : en
}
