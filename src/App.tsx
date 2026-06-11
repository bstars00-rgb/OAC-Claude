import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CloudAutoSync } from './components/CloudAutoSync'
import { MsAutoSync } from './components/MsAutoSync'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './theme'
import { LanguageProvider } from './i18n'
import { CaptureProvider } from './data/captureStore'
import { DatasetProvider } from './data/datasetStore'
import { AiSettingsProvider } from './utils/aiSettings'
import { Dashboard } from './pages/Dashboard'
import { OACAssistant } from './pages/OACAssistant'
import { Relationship360 } from './pages/Relationship360'
import { DataInsight } from './pages/DataInsight'
import { Central } from './pages/Central'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <CaptureProvider>
    <DatasetProvider>
    <AiSettingsProvider>
    <ToastProvider>
      <CloudAutoSync />
      <MsAutoSync />
      <Layout>
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
      </Layout>
    </ToastProvider>
    </AiSettingsProvider>
    </DatasetProvider>
    </CaptureProvider>
    </LanguageProvider>
    </ThemeProvider>
  )
}
