// Follow-up tasks mock data — with AI reasoning and originating source.

export type TaskStatus = 'Open' | 'In Progress' | 'Done'
export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskSource =
  | 'Meeting Recorder'
  | 'Outlook'
  | 'Teams'
  | 'Excel'
  | 'Internal DB'
  | 'AI Engine'

export interface Task {
  id: string
  entityId: string
  title: string
  owner: string
  dueDate: string // ISO date
  priority: TaskPriority
  status: TaskStatus
  aiReason: string
  source: TaskSource
}

import { getContentLang } from './contentLang'
import { taskKo } from './contentKo'

export const tasks: Task[] = [
  {
    id: 'tk-1',
    entityId: 'yeogi',
    title: 'Send official API integration inquiry to helpdesk@itank.net',
    owner: 'Aiden Park',
    dueDate: '2026-06-09',
    priority: 'High',
    status: 'Open',
    aiReason:
      'This is the single gating action — engineering allocation and the CEO briefing both depend on it.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-2',
    entityId: 'yeogi',
    title: 'Confirm Korea/Japan/Vietnam supply scope incl. Chalet Korea & Taiwan HRC',
    owner: 'Sophia Kim',
    dueDate: '2026-06-11',
    priority: 'High',
    status: 'In Progress',
    aiReason: 'CEO briefing cannot quote a firm inventory number until supply scope is confirmed.',
    source: 'Teams',
  },
  {
    id: 'tk-3',
    entityId: 'grandhyatt',
    title: 'Request net rate, July availability, suite rates, ALM & summer promotion',
    owner: 'Mina Seo',
    dueDate: '2026-06-11',
    priority: 'High',
    status: 'Open',
    aiReason: 'July suite inventory may sell out before terms are locked; act before the peak.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-4',
    entityId: 'klook',
    title: 'Counter 24/7 SLA clause and cap compensation wording with legal',
    owner: 'Daniel Cho',
    dueDate: '2026-06-10',
    priority: 'High',
    status: 'In Progress',
    aiReason: 'Protects Ohmyhotel from an unmeetable obligation and unbounded compensation liability.',
    source: 'Outlook',
  },
  {
    id: 'tk-5',
    entityId: 'dida',
    title: 'Schedule joint mapping & room-type validation review',
    owner: 'Mina Seo',
    dueDate: '2026-06-09',
    priority: 'High',
    status: 'Open',
    aiReason:
      'Worst-in-portfolio failure & cancellation rates; root cause is mapping accuracy, not demand.',
    source: 'Teams',
  },
  {
    id: 'tk-6',
    entityId: 'hotelbeds',
    title: 'Request waiver/deferral of USD 25,000 fee tied to go-live & rebate',
    owner: 'Daniel Cho',
    dueDate: '2026-06-12',
    priority: 'High',
    status: 'Open',
    aiReason: 'Avoid committing non-refundable cost before business feasibility is confirmed.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-7',
    entityId: 'medkorea',
    title: 'Send structured net-rate cooperation & prepaid settlement summary',
    owner: 'Soyeon Lim',
    dueDate: '2026-06-10',
    priority: 'High',
    status: 'In Progress',
    aiReason: 'Settlement clarity is the trust gate for the corporate cooperation to proceed.',
    source: 'Outlook',
  },
  {
    id: 'tk-8',
    entityId: 'goglobal',
    title: 'Confirm countersignature status and request API live key timing',
    owner: 'Aiden Park',
    dueDate: '2026-06-10',
    priority: 'High',
    status: 'In Progress',
    aiReason: 'Go-live is blocked only on the seal/signature confirmation and the live key.',
    source: 'Outlook',
  },
  {
    id: 'tk-9',
    entityId: 'traveloka',
    title: 'Deploy per-market (VN/KR/MY/JP) prebook failure monitoring',
    owner: 'Daniel Cho',
    dueDate: '2026-06-11',
    priority: 'Medium',
    status: 'In Progress',
    aiReason: 'Reduce prebook failures before the automated suspension threshold is reached.',
    source: 'Excel',
  },
  {
    id: 'tk-10',
    entityId: 'supdanang',
    title: 'Request final SUP Paddle Tour product sheet & operating conditions',
    owner: 'Soyeon Lim',
    dueDate: '2026-06-11',
    priority: 'Medium',
    status: 'Open',
    aiReason: 'Weather-cancellation policy is the main launch blocker for the water activity.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-11',
    entityId: 'danangsurf',
    title: 'Confirm booking cut-off, payment and weather/seasonal operation rules',
    owner: 'Soyeon Lim',
    dueDate: '2026-06-12',
    priority: 'Low',
    status: 'Open',
    aiReason: 'Winter/rainy-day operation rules prevent monsoon-period cancellation disputes.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-12',
    entityId: 'chaletkorea',
    title: 'Confirm iTANK API feasibility and scope Chalet Korea supply',
    owner: 'Aiden Park',
    dueDate: '2026-06-10',
    priority: 'High',
    status: 'In Progress',
    aiReason: 'Chalet Korea supply is on the critical path for the Yeogi Eottae CEO briefing.',
    source: 'Teams',
  },
  {
    id: 'tk-13',
    entityId: 'taiwanhrc',
    title: 'Gather Taiwan HRC destinations, settlement currency & expected volume',
    owner: 'Aiden Park',
    dueDate: '2026-06-12',
    priority: 'Medium',
    status: 'Open',
    aiReason: 'Settlement currency must be resolved before including Taiwan HRC in API scope.',
    source: 'Teams',
  },
  {
    id: 'tk-14',
    entityId: 'poseidon',
    title: 'Align on-site payment & no-show control, finalize Smart Store listing',
    owner: 'Soyeon Lim',
    dueDate: '2026-06-12',
    priority: 'Low',
    status: 'Open',
    aiReason: 'No-show control with on-site payment is the main revenue-leakage risk.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-15',
    entityId: 'aphrodite',
    title: 'Confirm payment, passport, weather-cancellation & charter terms',
    owner: 'Soyeon Lim',
    dueDate: '2026-06-11',
    priority: 'Medium',
    status: 'Open',
    aiReason: 'A deposit is already paid — undefined terms increase financial exposure.',
    source: 'Meeting Recorder',
  },
  {
    id: 'tk-16',
    entityId: 'webbeds',
    title: 'Build 30-prospect Korea list & validate JP/VN competitiveness',
    owner: 'Aiden Park',
    dueDate: '2026-06-13',
    priority: 'Medium',
    status: 'Open',
    aiReason: 'Validate Korea direct-contract strength before committing development resource.',
    source: 'Excel',
  },
]

const loc = (t: Task): Task => {
  if (getContentLang() !== 'ko') return t
  const ko = taskKo[t.id]
  return ko ? { ...t, ...ko } : t
}

export const tasksByEntity = (entityId: string): Task[] =>
  tasks.filter((t) => t.entityId === entityId).map(loc)

export const openTasks = (): Task[] => tasks.filter((t) => t.status !== 'Done').map(loc)

export const openTasksSorted = (): Task[] => {
  const rank: Record<TaskPriority, number> = { High: 0, Medium: 1, Low: 2 }
  return [...openTasks()].sort(
    (a, b) => rank[a.priority] - rank[b.priority] || a.dueDate.localeCompare(b.dueDate),
  )
}
