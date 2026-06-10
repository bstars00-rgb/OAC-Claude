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
  'nav.assistant': { en: 'OAC Assistant', ko: 'OAC 어시스턴트' },
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

  // AI Capture
  'page.capture.title': { en: 'AI Capture', ko: 'AI 캡처' },
  'page.capture.subtitle': {
    en: 'Type your work notes freely. OAC structures them into Account, Timeline, To Do, Risk and a Report — automatically.',
    ko: '업무 내용을 자유롭게 입력하세요. OAC가 자동으로 Account·Timeline·To Do·Risk·Report로 정리합니다.',
  },
  'cap.placeholder': {
    en: 'e.g. Met Klook on the SLA today. 24/7 support not feasible, legal review needed by next week. Compensation risk is high.',
    ko: '예: 오늘 Klook과 SLA 미팅. 24/7 지원 불가, 보상 문구 법무 검토 다음주까지 필요. 보상 리스크 큼.',
  },
  'cap.structure': { en: 'Structure with OAC', ko: 'OAC로 구조화' },
  'cap.thinking': { en: 'OAC is structuring your note into CRM records…', ko: 'OAC가 입력을 CRM 레코드로 구조화하는 중…' },
  'cap.tryExample': { en: 'Try an example', ko: '예시로 시작' },
  'cap.emptyTitle': { en: 'Capture anything — OAC turns it into CRM', ko: '무엇이든 입력하세요 — OAC가 CRM으로 정리합니다' },
  'cap.emptyDesc': {
    en: 'Customers, suppliers, partners, projects, recruiting, legal, operations — every business relationship. You type, OAC structures.',
    ko: '고객사·공급사·파트너·프로젝트·채용·법무·운영 등 모든 업무 관계. 입력하면 OAC가 정리합니다.',
  },
  'cap.account': { en: 'Account', ko: 'Account' },
  'cap.timeline': { en: 'Timeline', ko: 'Timeline' },
  'cap.todo': { en: 'To Do', ko: 'To Do' },
  'cap.risk': { en: 'Risk', ko: 'Risk' },
  'cap.report': { en: 'Report', ko: 'Report' },
  'cap.email': { en: 'Email', ko: 'Email' },
  'cap.summary': { en: 'Summary', ko: '요약' },
  'cap.new': { en: 'New account', ko: '신규 Account' },
  'cap.existing': { en: 'Existing relationship', ko: '기존 관계' },
  'cap.savedToCrm': { en: 'Saved to CRM workspace', ko: 'CRM 워크스페이스에 저장됨' },
  'cap.genReport': { en: 'Generate Report', ko: '리포트 생성' },
  'cap.draftEmail': { en: 'Draft Email', ko: '이메일 초안' },
  'cap.viewRel': { en: 'View Relationship 360', ko: '관계 360 보기' },
  'cap.noRisk': { en: 'No risks detected', ko: '감지된 리스크 없음' },
  'cap.noTodo': { en: 'No to-dos detected', ko: '감지된 To Do 없음' },
  'cap.workspace': { en: 'CRM Workspace', ko: 'CRM 워크스페이스' },
  'cap.liveStructured': { en: 'Live, structured from your captures', ko: '입력에서 실시간 구조화' },
  'cap.accounts': { en: 'Accounts', ko: 'Accounts' },
  'cap.openTodos': { en: 'Open To Dos', ko: '진행 To Do' },
  'cap.risks': { en: 'Risks', ko: 'Risks' },
  'cap.captures': { en: 'Captures', ko: '캡처' },
  'cap.recentAccounts': { en: 'Captured Accounts', ko: '캡처된 Account' },
  'cap.noAccounts': { en: 'No captured accounts yet.', ko: '아직 캡처된 Account가 없습니다.' },
  'cap.entries': { en: 'entries', ko: '건' },
  'cap.todosShort': { en: 'to-dos', ko: 'To Do' },
  'cap.clear': { en: 'Clear workspace', ko: '워크스페이스 비우기' },
  'cap.due': { en: 'due', ko: '마감' },

  // OAC Assistant (unified chat)
  'page.assistant.title': { en: 'OAC Assistant', ko: 'OAC 어시스턴트' },
  'page.assistant.subtitle': {
    en: 'Ask, upload images & documents, and OAC structures your work into Account, Timeline, To Do, Risk and reports.',
    ko: '질문하고, 이미지·문서를 올리면 OAC가 Account·Timeline·To Do·Risk·리포트로 정리합니다.',
  },
  'asst.placeholder': {
    en: 'Ask OAC, paste a work note, or attach an image / document…',
    ko: 'OAC에게 묻거나, 업무 메모를 붙여넣거나, 이미지·문서를 첨부하세요…',
  },
  'asst.send': { en: 'Send', ko: '전송' },
  'asst.image': { en: 'Image', ko: '이미지' },
  'asst.doc': { en: 'Document', ko: '문서' },
  'asst.thinking': { en: 'OAC is thinking…', ko: 'OAC가 생각하는 중…' },
  'asst.emptyTitle': { en: 'Ask anything — or just share what happened', ko: '무엇이든 물어보세요 — 또는 일어난 일을 입력하세요' },
  'asst.emptyDesc': {
    en: 'OAC answers questions, summarizes uploads, and turns your notes into CRM records. Connect the AI Engine for real AI.',
    ko: 'OAC가 질문에 답하고, 업로드를 요약하고, 메모를 CRM 레코드로 만듭니다. AI 엔진을 연결하면 실제 AI로 동작합니다.',
  },
  'asst.examplesHeader': { en: 'Try', ko: '예시' },
  'asst.engine': { en: 'AI Engine', ko: 'AI 엔진' },
  'asst.demoMode': { en: 'Demo (mock AI)', ko: '데모 (모의 AI)' },
  'asst.liveMode': { en: 'Live AI', ko: '실제 AI' },
  'asst.settings': { en: 'Settings', ko: '설정' },
  'asst.you': { en: 'You', ko: '나' },

  // Settings modal
  'set.title': { en: 'AI Engine Settings', ko: 'AI 엔진 설정' },
  'set.mode': { en: 'Mode', ko: '모드' },
  'set.demo': { en: 'Demo', ko: '데모' },
  'set.live': { en: 'Live AI', ko: '실제 AI' },
  'set.demoDesc': { en: 'Mock AI with local data. No API key needed.', ko: '로컬 데이터 기반 모의 AI. API 키 불필요.' },
  'set.liveDesc': { en: 'Calls the real Claude API with your own key (vision + documents).', ko: '내 API 키로 실제 Claude API 호출 (비전 + 문서).' },
  'set.apiKey': { en: 'Anthropic API key', ko: 'Anthropic API 키' },
  'set.model': { en: 'Model', ko: '모델' },
  'set.warn': {
    en: 'Your key is stored only in this browser and sent directly to Anthropic. Use a personal key for this prototype — never a shared/production key.',
    ko: '키는 이 브라우저에만 저장되어 Anthropic으로만 직접 전송됩니다. 이 프로토타입에서는 개인 키만 사용하세요 (공유/운영 키 금지).',
  },
  'set.getKey': { en: 'Get a key at console.anthropic.com', ko: 'console.anthropic.com에서 키 발급' },
  'set.done': { en: 'Done', ko: '완료' },
  'set.connected': { en: 'Connected', ko: '연결됨' },

  'asst.saved': { en: 'Saved', ko: '저장됨' },
  'asst.details': { en: 'Details', ko: '자세히' },
  'asst.hide': { en: 'Hide', ko: '접기' },

  // Relationship 360 — assistant overlay
  'rel.updatedByAssistant': { en: 'Updated by OAC Assistant', ko: 'OAC 어시스턴트가 업데이트함' },
  'rel.askAssistant': { en: 'Ask Assistant', ko: '어시스턴트에게 묻기' },
  'rel.latestFromAssistant': { en: 'Latest from OAC Assistant', ko: 'OAC 어시스턴트 최근 활동' },
  'rel.fromAssistant': { en: 'From the OAC Assistant', ko: 'OAC 어시스턴트가 만든 항목' },

  // Settings page
  'page.settings.title': { en: 'Settings', ko: '설정' },
  'page.settings.subtitle': { en: 'AI engine, integrations, and workspace preferences.', ko: 'AI 엔진, 연동, 워크스페이스 설정.' },
  'nav.settings': { en: 'Settings', ko: '설정' },
  'set.aiEngine': { en: 'AI Engine', ko: 'AI 엔진' },
  'set.aiEngineSub': { en: 'Demo (mock) or your own Claude API key', ko: '데모(모의) 또는 본인 Claude API 키' },
  'set.workspace': { en: 'Workspace', ko: '워크스페이스' },
  'set.clearWorkspace': { en: 'Clear captured workspace data', ko: '캡처된 워크스페이스 데이터 비우기' },
  'set.autosaved': { en: 'Changes are saved automatically — just go to the OAC Assistant.', ko: '변경사항은 자동 저장됩니다 — 바로 OAC 어시스턴트에서 사용하세요. (별도 완료 버튼 없음)' },
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
