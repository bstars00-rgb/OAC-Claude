import { SearchBar } from './SearchBar'
import { useTheme } from '../theme'
import { useT } from '../i18n'

interface Connection {
  label: string
  tone: string
}

// Demo connection badges — make the app feel fully integrated.
const connections: Connection[] = [
  { label: 'Outlook', tone: 'bg-sky-500' },
  { label: 'Teams', tone: 'bg-violet-500' },
  { label: 'Excel', tone: 'bg-emerald-500' },
  { label: 'Internal DB', tone: 'bg-slate-500' },
  { label: 'Meeting Recorder', tone: 'bg-brand-500' },
]

export function Topbar({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useT()

  return (
    <header className="z-10 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:gap-4 sm:px-6 dark:border-white/10 dark:bg-[#0b1220]/80">
      {/* D-11: mobile menu toggle */}
      <button onClick={onMenuClick} aria-label="Open menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <SearchBar />

      <div className="ml-auto flex items-center gap-3">
        {/* Connection badges */}
        <div className="hidden items-center gap-1.5 2xl:flex">
          {connections.map((c) => (
            <span
              key={c.label}
              title={`${c.label} Connected Demo`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.tone}`} />
              {c.label}
            </span>
          ))}
        </div>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 lg:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t('top.allConnected')}
        </span>

        {/* Language toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
          {(['en', 'ko'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                lang === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {l === 'en' ? 'EN' : '한국어'}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? t('top.theme.light') : t('top.theme.dark')}
          aria-label={theme === 'dark' ? t('top.theme.light') : t('top.theme.dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-bold text-white">
            AP
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Aiden Park</div>
            <div className="text-[10px] text-slate-500">{t('top.role')}</div>
          </div>
        </div>
      </div>
    </header>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
