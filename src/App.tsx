import { lazy, Suspense } from 'react'
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
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const OACAssistant = lazy(() => import('./pages/OACAssistant').then((m) => ({ default: m.OACAssistant })))
const Relationship360 = lazy(() => import('./pages/Relationship360').then((m) => ({ default: m.Relationship360 })))
const DataInsight = lazy(() => import('./pages/DataInsight').then((m) => ({ default: m.DataInsight })))
const Central = lazy(() => import('./pages/Central').then((m) => ({ default: m.Central })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))

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
