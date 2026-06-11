import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { useT } from '../i18n'
import { useAiSettings } from '../utils/aiSettings'
import { loadUsage, todayTotals, monthTotals, projectMonthly, dailyCostSeries, clearUsage, PRICING, USD_TO_KRW, type Totals } from '../utils/usage'

const usd = (n: number) => '$' + n.toFixed(n < 1 ? 4 : 2)
const krw = (n: number) => '≈ ₩' + Math.round(n * USD_TO_KRW).toLocaleString()
const tok = (n: number) => (n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n))

// Token usage & metered API cost for the user's own key — daily, monthly, and a
// month-end projection. The monthly subscription is separate from this.
export function UsageCard() {
  const { lang } = useT()
  const ai = useAiSettings()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [tick, setTick] = useState(0)

  // refresh when a call records usage
  useEffect(() => {
    const on = () => setTick((t) => t + 1)
    window.addEventListener('oac-usage-updated', on)
    return () => window.removeEventListener('oac-usage-updated', on)
  }, [])

  const { today, month, proj, series, hasData } = useMemo(() => {
    const store = loadUsage()
    const today = todayTotals(store)
    const month = monthTotals(store)
    const proj = projectMonthly(store)
    const series = dailyCostSeries(14, store)
    return { today, month, proj, series, hasData: month.calls > 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const maxDay = Math.max(...series.map((s) => s.cost), 0.0001)
  const price = PRICING[ai.model]

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <CardHeader
          title={L('API 사용량 · 비용', 'API usage & cost')}
          subtitle={L('월 정액과 별개로, 내 키로 호출한 토큰의 종량 비용입니다 (USD 청구)', 'Metered token cost on your own key — separate from the monthly subscription (billed in USD)')}
          icon={<CoinIcon />}
        />
        {hasData && <button onClick={() => { if (window.confirm(L('사용량 기록을 초기화할까요?', 'Reset usage history?'))) clearUsage() }} className="shrink-0 text-[11px] text-slate-400 hover:text-rose-500">{L('초기화', 'Reset')}</button>}
      </div>

      {/* current model rate */}
      {price && (
        <div className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
          {L('현재 모델', 'Current model')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{price.label}</span> · {L('입력', 'in')} ${price.inputPerM}/M · {L('출력', 'out')} ${price.outputPerM}/M ({L('백만 토큰당', 'per 1M tokens')})
        </div>
      )}

      {!hasData ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-white/5">
          {L('아직 기록된 사용량이 없습니다. 라이브 모드(키 입력)에서 OAC에 질문하면 여기 토큰·비용이 쌓입니다.', 'No usage yet. Ask OAC in live mode (with a key) and your tokens & cost will accrue here.')}
        </p>
      ) : (
        <>
          {/* three KPI tiles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile L={L} title={L('오늘', 'Today')} totals={today} />
            <Tile L={L} title={L('이번 달', 'This month')} totals={month} />
            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3 dark:border-brand-500/30 dark:bg-brand-500/10">
              <div className="text-[11px] font-semibold text-brand-700">{L('월말 예상', 'Projected month')}</div>
              <div className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{usd(proj.projected)}</div>
              <div className="text-[11px] text-slate-500">{krw(proj.projected)}</div>
              <div className="mt-1 text-[10px] text-slate-400">{L(`일평균 ${usd(proj.avgPerDay)} × ${proj.daysInMonth}일`, `${usd(proj.avgPerDay)}/day × ${proj.daysInMonth}d`)}</div>
            </div>
          </div>

          {/* 14-day daily cost chart */}
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-500">{L('최근 14일 일별 비용', 'Daily cost · last 14 days')}</div>
            <div className="flex items-end gap-1" style={{ height: 70 }}>
              {series.map((s) => (
                <div key={s.label} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${s.label}: ${usd(s.cost)}`}>
                  <div className="w-full rounded-t bg-gradient-to-t from-brand-600 to-violet-500" style={{ height: `${Math.max(2, (s.cost / maxDay) * 54)}px` }} />
                  <span className="text-[8px] text-slate-400">{s.label.slice(3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* per-model breakdown (this month) */}
          {month.byModel.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-500">{L('모델별 (이번 달)', 'By model (this month)')}</div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-1 pr-3 font-medium">{L('모델', 'Model')}</th>
                    <th className="py-1 pr-3 text-right font-medium">{L('입력', 'In')}</th>
                    <th className="py-1 pr-3 text-right font-medium">{L('출력', 'Out')}</th>
                    <th className="py-1 text-right font-medium">{L('비용', 'Cost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {month.byModel.map((m) => (
                    <tr key={m.model} className="border-t border-slate-100 dark:border-white/5">
                      <td className="py-1 pr-3 font-medium text-slate-700 dark:text-slate-200">{m.label}</td>
                      <td className="py-1 pr-3 text-right text-slate-500">{tok(m.in)}</td>
                      <td className="py-1 pr-3 text-right text-slate-500">{tok(m.out)}</td>
                      <td className="py-1 text-right font-semibold text-slate-700 dark:text-slate-200">{usd(m.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            {L(`단가는 공개 정가 기준 추정이며 캐시·배치 할인은 반영하지 않습니다. ₩는 1 USD ≈ ₩${USD_TO_KRW.toLocaleString()} 기준 근사치입니다. 정확한 청구액은 콘솔에서 확인하세요.`, `Costs are estimates at list prices (no cache/batch discounts). ₩ uses 1 USD ≈ ₩${USD_TO_KRW.toLocaleString()}. Check your provider console for the exact bill.`)}
          </p>
        </>
      )}
    </Card>
  )
}

function Tile({ L, title, totals }: { L: (ko: string, en: string) => string; title: string; totals: Totals }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500">{title}</span>
        <Badge tone="slate">{totals.calls} {L('호출', 'calls')}</Badge>
      </div>
      <div className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{usd(totals.cost)}</div>
      <div className="text-[11px] text-slate-500">{krw(totals.cost)}</div>
      <div className="mt-1 text-[10px] text-slate-400">{L('입력', 'in')} {tok(totals.in)} · {L('출력', 'out')} {tok(totals.out)}</div>
    </div>
  )
}

function CoinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M14.8 9a2.8 2.8 0 0 0-2.8-1.8c-1.6 0-2.8.9-2.8 2.2 0 3 5.6 1.5 5.6 4.6 0 1.3-1.2 2.2-2.8 2.2A2.8 2.8 0 0 1 9.2 15M12 6v1.2M12 16.8V18" /></svg>
}
