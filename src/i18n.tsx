import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ko'

// UI-chrome translations. Business/mock content stays in its source language;
// this covers navigation, page headers, tabs and recurring labels so the
// language toggle is visibly meaningful.
type Entry = { en: string; ko: string }

const DICT: Record<string, Entry> = {
  // Brand
  'brand.subtitle': { en: 'AI CRM', ko: 'AI CRM' },

  // Navigation
  'nav.dashboard': { en: 'Dashboard', ko: '대시보드' },
  'nav.ask': { en: 'Ask OAC', ko: 'OAC에게 묻기' },
  'nav.relationship': { en: 'Relationship 360', ko: '관계 360' },
  'nav.meeting': { en: 'Meeting Recorder', ko: '미팅 레코더' },
  'nav.email': { en: 'Email Assistant', ko: '이메일 어시스턴트' },
  'nav.report': { en: 'Report Generator', ko: '리포트 생성기' },
  'nav.data': { en: 'Data Insight', ko: '데이터 인사이트' },
  'nav.integrations': { en: 'Integrations', ko: '연동' },

  // Topbar
  'top.allConnected': { en: 'All Connected · Demo', ko: '전체 연결 · 데모' },
  'top.role': { en: 'Sales Lead', ko: '세일즈 리드' },
  'top.search': { en: 'Search a relationship or ask OAC…', ko: '관계를 검색하거나 OAC에게 물어보세요…' },
  'top.lang': { en: 'Language', ko: '언어' },
  'top.theme.light': { en: 'Light', ko: '라이트' },
  'top.theme.dark': { en: 'Dark', ko: '다크' },

  // Page headers
  'page.dashboard.title': { en: "Today's AI Briefing", ko: '오늘의 AI 브리핑' },
  'page.dashboard.subtitle': {
    en: 'OAC reviewed your meetings, emails, Teams messages, Excel files, and internal DB. Here are the business relationships that need attention today.',
    ko: 'OAC가 미팅, 이메일, Teams 메시지, Excel 파일, 내부 DB를 검토했습니다. 오늘 주의가 필요한 비즈니스 관계입니다.',
  },
  'page.ask.title': { en: 'Ask OAC', ko: 'OAC에게 묻기' },
  'page.ask.subtitle': {
    en: 'Search a name or ask a question. OAC will find the context, summarize the status, and prepare the next action.',
    ko: '이름을 검색하거나 질문하세요. OAC가 맥락을 찾아 상태를 요약하고 다음 액션을 준비합니다.',
  },
  'page.relationship.title': { en: 'Relationship 360', ko: '관계 360' },
  'page.relationship.subtitle': {
    en: 'One place for every meeting, email, Teams message, task, report, and data insight.',
    ko: '모든 미팅, 이메일, Teams 메시지, 작업, 리포트, 데이터 인사이트를 한곳에서.',
  },
  'page.meeting.title': { en: 'Meeting Recorder', ko: '미팅 레코더' },
  'page.meeting.subtitle': {
    en: 'Paste meeting notes or upload a recording. OAC turns it into CRM intelligence.',
    ko: '미팅 노트를 붙여넣거나 녹음을 업로드하세요. OAC가 CRM 인텔리전스로 변환합니다.',
  },
  'page.email.title': { en: 'Email Assistant', ko: '이메일 어시스턴트' },
  'page.email.subtitle': {
    en: 'Generate context-aware emails from meetings, previous communication, and next actions.',
    ko: '미팅, 이전 커뮤니케이션, 다음 액션을 바탕으로 맥락에 맞는 이메일을 생성합니다.',
  },
  'page.report.title': { en: 'Report Generator', ko: '리포트 생성기' },
  'page.report.subtitle': {
    en: 'Create CEO briefings, partner status reports, issue reports, and sales updates from OAC context.',
    ko: 'OAC 맥락에서 CEO 브리핑, 파트너 현황 리포트, 이슈 리포트, 세일즈 업데이트를 생성합니다.',
  },
  'page.data.title': { en: 'Data Insight', ko: '데이터 인사이트' },
  'page.data.subtitle': {
    en: 'Turn booking, revenue, cancellation, failure, and operational data into AI-powered business strategy.',
    ko: '예약, 매출, 취소, 실패, 운영 데이터를 AI 기반 비즈니스 전략으로 전환합니다.',
  },
  'page.integrations.title': { en: 'Integrations', ko: '연동' },
  'page.integrations.subtitle': {
    en: 'OAC connects meetings, emails, Teams messages, Excel data, and internal booking systems into one AI relationship workspace.',
    ko: 'OAC는 미팅, 이메일, Teams 메시지, Excel 데이터, 내부 예약 시스템을 하나의 AI 관계 워크스페이스로 연결합니다.',
  },

  // Relationship 360 tabs
  'tab.overview': { en: 'Overview', ko: '개요' },
  'tab.timeline': { en: 'Timeline', ko: '타임라인' },
  'tab.communication': { en: 'Communication', ko: '커뮤니케이션' },
  'tab.tasks': { en: 'Tasks', ko: '작업' },
  'tab.data': { en: 'Data', ko: '데이터' },
  'tab.ai': { en: 'AI Recommendation', ko: 'AI 추천' },

  // Common
  'common.askOAC': { en: 'Ask OAC', ko: 'OAC에게 묻기' },
  'common.viewAll': { en: 'View all', ko: '전체 보기' },
}

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (key: string) => string
}

const Ctx = createContext<I18nCtx | null>(null)

const readInitial = (): Lang => {
  try {
    const stored = localStorage.getItem('oac-lang') as Lang | null
    if (stored === 'en' || stored === 'ko') return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('oac-lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)
  const toggleLang = () => setLangState((l) => (l === 'en' ? 'ko' : 'en'))
  const t = (key: string) => DICT[key]?.[lang] ?? key

  return <Ctx.Provider value={{ lang, setLang, toggleLang, t }}>{children}</Ctx.Provider>
}

export function useT(): I18nCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useT must be used within LanguageProvider')
  return ctx
}
