import { lazy, Suspense, type ComponentType } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CloudAutoSync } from './components/CloudAutoSync'
import { MsAutoSync } from './components/MsAutoSync'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './theme'
import { LanguageProvider } from './i18n'
import { CaptureProvider } from './data/captureStore'
import { DatasetProvider } from './data/datasetStore'
import { AiSettingsProvider } from './utils/aiSettings'

// Code-split each route into its own chunk (loaded on navigation) so the initial
// bundle stays small. Pages use named exports → map to default for React.lazy.
//
// After a new deploy the chunk filenames change; a stale tab/cache may request an
// old hash that GitHub Pages no longer has → "Failed to fetch dynamically imported
// module". lazyRoute() recovers by force-reloading ONCE to pick up the fresh
// manifest; if it still fails, the error propagates to the ErrorBoundary.
const RELOAD_KEY = 'oac-chunk-reload'
function lazyRoute<T extends { default: ComponentType<unknown> }>(factory: () => Promise<T>) {
  return lazy(async () => {
    try {
      const mod = await factory()
      sessionStorage.removeItem(RELOAD_KEY)
      return mod
    } catch (err) {
      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return new Promise<T>(() => {}) // never resolves; the page is reloading
      }
      throw err
    }
  })
}

const Dashboard = lazyRoute(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const OACAssistant = lazyRoute(() => import('./pages/OACAssistant').then((m) => ({ default: m.OACAssistant })))
const Relationship360 = lazyRoute(() => import('./pages/Relationship360').then((m) => ({ default: m.Relationship360 })))
const DataInsight = lazyRoute(() => import('./pages/DataInsight').then((m) => ({ default: m.DataInsight })))
const Central = lazyRoute(() => import('./pages/Central').then((m) => ({ default: m.Central })))
const Settings = lazyRoute(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))

function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
    </div>
  )
}

function AppRoutes() {
  // Key the boundary by path so navigating to another screen clears a crashed one.
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assistant" element={<OACAssistant />} />
        <Route path="/relationship" element={<Relationship360 />} />
        <Route path="/relationship/:id" element={<Relationship360 />} />
        <Route path="/data" element={<DataInsight />} />
        <Route path="/central" element={<Central />} />
        <Route path="/settings" element={<Settings />} />
        {/* Legacy paths — Ask OAC, AI Capture, Email, Report, Meeting are now
            all handled inside the OAC Assistant; Integrations live in Settings. */}
        <Route path="/ask" element={<OACAssistant />} />
        <Route path="/capture" element={<OACAssistant />} />
        <Route path="/email" element={<OACAssistant />} />
        <Route path="/report" element={<OACAssistant />} />
        <Route path="/meeting" element={<OACAssistant />} />
        <Route path="/integrations" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
    <LanguageProvider>
    <CaptureProvider>
    <DatasetProvider>
    <AiSettingsProvider>
    <ToastProvider>
      <CloudAutoSync />
      <MsAutoSync />
      <Layout>
        <AppRoutes />
      </Layout>
    </ToastProvider>
    </AiSettingsProvider>
    </DatasetProvider>
    </CaptureProvider>
    </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
