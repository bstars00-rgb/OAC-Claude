import { Component, type ReactNode } from 'react'

// React error boundary: catches a render/runtime error in the subtree and shows a
// friendly fallback instead of unmounting the whole app to a blank white screen.
// No backend → the error is only logged to the console, never sent anywhere.
interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('OAC ErrorBoundary caught:', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    const ko = (() => {
      try { return localStorage.getItem('oac-lang') === 'ko' } catch { return false }
    })()
    return <Fallback error={this.state.error} ko={ko} onReset={this.reset} />
  }
}

function Fallback({ error, ko, onReset }: { error: Error; ko: boolean; onReset: () => void }) {
  return (
    <div className="oac-fade-in flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm dark:border-rose-500/30 dark:bg-white/[0.04]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" /></svg>
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          {ko ? '이 화면에서 문제가 발생했어요' : 'Something went wrong on this screen'}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {ko
            ? '앱의 다른 부분은 정상입니다. 다시 시도하거나, 왼쪽 메뉴로 다른 화면으로 이동하세요. 저장된 데이터는 그대로 있습니다.'
            : 'The rest of the app is fine. Retry, or use the left menu to go to another screen. Your saved data is intact.'}
        </p>
        <details className="mt-3 text-left">
          <summary className="cursor-pointer text-[11px] font-semibold text-slate-400 hover:text-slate-600">
            {ko ? '오류 상세' : 'Error details'}
          </summary>
          <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 text-[11px] text-rose-600 dark:bg-white/5">{error.message}</pre>
        </details>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={onReset} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
            {ko ? '다시 시도' : 'Retry'}
          </button>
          <button onClick={() => window.location.reload()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
            {ko ? '새로고침' : 'Reload'}
          </button>
        </div>
      </div>
    </div>
  )
}
