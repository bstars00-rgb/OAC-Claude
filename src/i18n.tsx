import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { setContentLang } from './data/contentLang'

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

  // Section / card labels (shown next to localized content)
  'l.morningBriefing': { en: 'OAC Morning Briefing', ko: 'OAC 모닝 브리핑' },
  'l.priorityRel': { en: 'Priority Relationships', ko: '우선 관계' },
  'l.rankedHealth': { en: 'Ranked by health & open risk', ko: '건강도·오픈 리스크 기준 정렬' },
  'l.recentMeetings': { en: 'Recent Meetings', ko: '최근 미팅' },
  'l.capturedRecorder': { en: 'Captured by Meeting Recorder Demo', ko: '미팅 레코더 데모로 캡처됨' },
  'l.contextsAttention': { en: 'Contexts Needing Attention', ko: '주의가 필요한 맥락' },
  'l.groupedContext': { en: 'Grouped by OAC Detected Context — not account type', ko: 'OAC 감지 맥락 기준 그룹화 — 계정 유형 아님' },
  'l.openFollowups': { en: 'Open Follow-ups', ko: '진행 중 후속 작업' },
  'l.acrossRel': { en: 'across relationships', ko: '관계 전반' },
  'l.draftEmails': { en: 'Draft Emails', ko: '이메일 초안' },
  'l.suggestedByOAC': { en: 'Suggested by OAC', ko: 'OAC 제안' },
  'l.aiRecActions': { en: 'AI Recommended Actions', ko: 'AI 추천 액션' },
  'l.activeRel': { en: 'Active Relationships', ko: '활성 관계' },
  'l.monthlyTtv': { en: 'Monthly TTV (Demo)', ko: '월 거래액(데모)' },
  'l.monthlyBookings': { en: 'Monthly Bookings', ko: '월 예약' },
  'l.atRisk': { en: 'at risk', ko: '위험' },
  'l.high': { en: 'high', ko: '높음' },
  'l.issue': { en: 'Issue', ko: '이슈' },
  'l.nextBestActionShort': { en: 'Next best action', ko: '다음 베스트 액션' },
  'l.followups': { en: 'follow-ups', ko: '후속 작업' },
  'l.openMeetingRecorder': { en: 'Open Meeting Recorder', ko: '미팅 레코더 열기' },
  'l.openInEmail': { en: 'Open in Email Assistant', ko: '이메일 어시스턴트에서 열기' },

  // Relationship 360
  'l.nextBestAction': { en: 'Next Best Action', ko: '다음 베스트 액션' },
  'l.switchRel': { en: 'Switch relationship', ko: '관계 전환' },
  'l.owner': { en: 'Owner', ko: '담당' },
  'l.lastContact': { en: 'Last contact', ko: '최근 연락' },
  'l.healthScore': { en: 'Health Score', ko: '건강 점수' },
  'l.relSummary': { en: 'OAC Relationship Summary', ko: 'OAC 관계 요약' },
  'l.whatsHappening': { en: "What's happening?", ko: '무슨 일이 일어나고 있나요?' },
  'l.generatedFrom': { en: 'Generated from meetings, emails, Teams, Excel, and internal DB · AI Engine Demo', ko: '미팅·이메일·Teams·Excel·내부 DB에서 생성 · AI 엔진 데모' },
  'l.currentFocusOpp': { en: 'Current Focus & Opportunity', ko: '현재 포커스 & 기회' },
  'l.currentFocus': { en: 'Current Focus', ko: '현재 포커스' },
  'l.opportunity': { en: 'Opportunity', ko: '기회' },
  'l.recommendedAction': { en: 'Recommended Action', ko: '추천 액션' },
  'l.oacStrategy': { en: 'OAC strategy', ko: 'OAC 전략' },
  'l.openIssues': { en: 'Open Issues', ko: '오픈 이슈' },
  'l.risks': { en: 'Risks', ko: '리스크' },
  'l.relatedSources': { en: 'Related Data Sources', ko: '관련 데이터 소스' },
  'l.draftTheEmail': { en: 'Draft the email', ko: '이메일 작성' },

  // Ask OAC briefing sections
  'l.briefing': { en: 'Briefing', ko: '브리핑' },
  's.currentStatus': { en: 'Current Status', ko: '현재 상태' },
  's.recentComm': { en: 'Recent Communication', ko: '최근 커뮤니케이션' },
  's.openIssues': { en: 'Open Issues', ko: '오픈 이슈' },
  's.risks': { en: 'Risks', ko: '리스크' },
  's.nextBestAction': { en: 'Next Best Action', ko: '다음 베스트 액션' },
  's.suggestedEmail': { en: 'Suggested Email', ko: '추천 이메일' },
  's.suggestedReport': { en: 'Suggested CEO Report', ko: '추천 CEO 리포트' },
  's.relatedData': { en: 'Related Sales / Data Insight', ko: '관련 세일즈 / 데이터 인사이트' },
  'b.draftEmail': { en: 'Draft Email', ko: '이메일 작성' },
  'b.createCeoReport': { en: 'Create CEO Report', ko: 'CEO 리포트 생성' },
  'b.viewRel360': { en: 'View Relationship 360', ko: '관계 360 보기' },
  'b.createTask': { en: 'Create Follow-up Task', ko: '후속 작업 생성' },
  'b.showData': { en: 'Show Data Insight', ko: '데이터 인사이트 보기' },
  'b.createReport': { en: 'Create Report', ko: '리포트 생성' },
  'l.suggestedFollowups': { en: 'Suggested follow-ups', ko: '추천 후속 질문' },
  'l.detectedRel': { en: 'Detected Relationship', ko: '감지된 관계' },
  'l.connectedSources': { en: 'Connected Sources', ko: '연결된 소스' },
  'l.relatedRecords': { en: 'Related Records', ko: '관련 레코드' },
  'l.contextConfidence': { en: 'Context confidence', ko: '맥락 신뢰도' },
  'l.openRel360': { en: 'Open Relationship 360', ko: '관계 360 열기' },
  'r.meetings': { en: 'Meetings', ko: '미팅' },
  'r.emails': { en: 'Emails', ko: '이메일' },
  'r.teams': { en: 'Teams messages', ko: 'Teams 메시지' },
  'r.tasks': { en: 'Tasks', ko: '작업' },
  'r.sales': { en: 'Sales data', ko: '세일즈 데이터' },
  'l.askAnything': { en: 'Ask OAC anything', ko: 'OAC에게 무엇이든 물어보세요' },
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

  // Keep the data-layer content language in sync synchronously, before children
  // render, so localized data accessors return the right language.
  setContentLang(lang)

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
