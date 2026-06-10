// Turn imported RawData groups (hotels / sellers / …) into searchable
// relationships, so the user can find "Grand Hyatt Jeju" in Relationship 360 and
// see its imported ¥ metrics — bridging the data layer and the relationship layer.

import type { DatasetSnapshot, GroupRow } from '../utils/dataImport'
import type { Entity, Region } from './entities'
import type { Lang } from '../i18n'

const slug = (name: string) =>
  'ds-' + name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)

const COUNTRY_REGION: Record<string, Region> = {
  KR: 'Korea', KOR: 'Korea', JP: 'Japan', JPN: 'Japan', VN: 'Vietnam', VNM: 'Vietnam',
  CN: 'China', CHN: 'China', TW: 'Taiwan', TWN: 'Taiwan', GR: 'Greece',
}

const yen = (n: number) => '¥' + Math.round(n).toLocaleString()

export interface DatasetGroupRef {
  snapshot: DatasetSnapshot
  group: GroupRow
}

// Newest snapshot per profile; key groups by name (first wins).
export function latestGroupsByName(snapshots: DatasetSnapshot[]): Map<string, DatasetGroupRef> {
  const map = new Map<string, DatasetGroupRef>()
  const seenProfile = new Set<string>()
  for (const s of snapshots) {
    if (seenProfile.has(s.profile)) continue
    seenProfile.add(s.profile)
    for (const g of s.groups) {
      const k = g.key.toLowerCase()
      if (!map.has(k)) map.set(k, { snapshot: s, group: g })
    }
  }
  return map
}

export function datasetMetricsFor(snapshots: DatasetSnapshot[], name: string): DatasetGroupRef | undefined {
  return latestGroupsByName(snapshots).get(name.toLowerCase())
}

function regionOf(g: GroupRow): Region {
  const c = (g.dims['Hotel Country'] || g.dims['Seller Country'] || g.dims['Country'] || '').toUpperCase().trim()
  return COUNTRY_REGION[c] ?? 'Global'
}

export function synthDatasetRelationship(ref: DatasetGroupRef, lang: Lang): Entity {
  const ko = lang === 'ko'
  const { group: g, snapshot: s } = ref
  const sales = g.metrics['판매액(¥)'] ?? 0
  const revenue = g.metrics['수익(¥)'] ?? 0
  const nights = g.metrics['룸나잇'] ?? 0
  const margin = sales > 0 ? revenue / sales : 0
  const health = sales > 0 ? Math.max(50, Math.min(92, Math.round(55 + margin * 180))) : 70

  const metricLine = s.mapping.metrics
    .map((m) => `${m.label} ${m.label.includes('¥') ? yen(g.metrics[m.label] ?? 0) : Math.round(g.metrics[m.label] ?? 0).toLocaleString()}`)
    .join(' · ')
  const profileName = s.profile === 'booking' ? (ko ? '부킹' : 'Booking') : (ko ? '체크아웃' : 'Check Out')
  // Lead with profile + period so a bare label like "22" reads as a booking period, not a stray number.
  const periodTag = /^\d{1,2}$/.test(s.periodLabel) ? (ko ? `${profileName} ${s.periodLabel}주차` : `${profileName} wk ${s.periodLabel}`) : `${profileName} ${s.periodLabel}`
  const summary = ko
    ? `${periodTag} 기준 ${metricLine} (${g.rows.toLocaleString()}건, 마진 ${(margin * 100).toFixed(1)}%).`
    : `${periodTag}: ${metricLine} (${g.rows.toLocaleString()} rows, margin ${(margin * 100).toFixed(1)}%).`

  return {
    id: slug(g.key),
    name: g.key,
    owner: ko ? '데이터' : 'Data',
    region: regionOf(g),
    relationshipHealthScore: health,
    lastContactDate: s.importedAt,
    detectedContext: ko ? `${profileName} 데이터 · ${s.mapping.dimension}` : `${profileName} data · ${s.mapping.dimension}`,
    contextConfidence: 90,
    currentFocus: metricLine,
    opportunity: '',
    summary,
    openIssues: [],
    risks: nights === 0 ? [] : [],
    recommendedAction: ko ? '데이터 추세를 검토하고 다음 액션을 정하세요.' : 'Review the data trend and decide the next action.',
    nextBestAction: ko ? `${profileName} 추세 검토` : `Review ${profileName} trend`,
    relatedSources: ['Internal DB', 'Excel'],
  }
}

export function datasetRelationships(snapshots: DatasetSnapshot[], lang: Lang): Entity[] {
  const refs = [...latestGroupsByName(snapshots).values()]
  return refs
    .map((ref) => ({ ref, sales: ref.group.metrics['판매액(¥)'] ?? ref.group.rows }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 60)
    .map(({ ref }) => synthDatasetRelationship(ref, lang))
}
