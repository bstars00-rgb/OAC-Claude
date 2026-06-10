// Unified relationship source. In demo mode it returns the seeded Ohmyhotel
// relationships; in real mode it synthesizes relationships from the user's own
// captured data (the OAC Assistant workspace).

import { useT, type Lang } from '../i18n'
import { useCaptureStore, type CaptureAccount, type CaptureEntry } from './captureStore'
import { useDatasets } from './datasetStore'
import { datasetRelationships } from './datasetRelationships'
import { type Entity, type Region } from './entities'

const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))]

export function synthRelationship(a: CaptureAccount, entries: CaptureEntry[], lang: Lang): Entity {
  const latest = entries[0]
  const nextBestAction =
    entries.find((e) => e.nextBestAction)?.nextBestAction ??
    entries.flatMap((e) => e.todos).find((t) => !t.done)?.text ??
    (lang === 'ko' ? '다음 액션 정하기' : 'Decide the next action')
  const risks = uniq(entries.flatMap((e) => e.risks)).slice(0, 6)
  const openTodos = entries.flatMap((e) => e.todos).filter((t) => !t.done)
  const openIssues = openTodos.map((t) => t.text).slice(0, 6)
  const health = Math.max(45, Math.min(90, 78 - risks.length * 6))
  return {
    id: a.accountId,
    name: a.accountName,
    owner: lang === 'ko' ? '나' : 'You',
    region: 'Global' as Region,
    relationshipHealthScore: health,
    lastContactDate: a.lastDate,
    detectedContext: a.detectedContext,
    contextConfidence: 88,
    currentFocus: latest?.summary ?? '',
    opportunity: '',
    summary: latest?.summary ?? (lang === 'ko' ? '아직 기록이 없습니다.' : 'No notes yet.'),
    openIssues,
    risks,
    recommendedAction: nextBestAction,
    nextBestAction,
    relatedSources: ['Internal DB'],
  }
}

export interface RelationshipsResult {
  isDemo: boolean
  list: Entity[]
  byId: (id: string) => Entity | undefined
}

export function useRelationships(): RelationshipsResult {
  const { lang } = useT()
  const store = useCaptureStore()
  const datasets = useDatasets()

  // Real data only — captured (assistant) relationships + relationships
  // synthesized from imported RawData. (Demo sample data has been removed.)
  const captured = store.accounts.map((a) => synthRelationship(a, store.entriesByEntity(a.accountId), lang))
  const fromData = datasetRelationships(datasets.snapshots, lang)
  const seen = new Set(captured.map((e) => e.id))
  const list = [...captured, ...fromData.filter((e) => !seen.has(e.id))]
  return { isDemo: false, list, byId: (id) => list.find((e) => e.id === id) }
}
