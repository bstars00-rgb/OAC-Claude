import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './theme'
import { LanguageProvider } from './i18n'
import { CaptureProvider } from './data/captureStore'
import { AiSettingsProvider } from './utils/aiSettings'
import { Dashboard } from './pages/Dashboard'
import { OACAssistant } from './pages/OACAssistant'
import { Relationship360 } from './pages/Relationship360'
import { MeetingRecorder } from './pages/MeetingRecorder'
import { EmailAssistant } from './pages/EmailAssistant'
import { ReportGenerator } from './pages/ReportGenerator'
import { DataInsight } from './pages/DataInsight'
import { Integrations } from './pages/Integrations'

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <CaptureProvider>
    <AiSettingsProvider>
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assistant" element={<OACAssistant />} />
          {/* Legacy paths — Ask OAC + AI Capture are now unified */}
          <Route path="/ask" element={<OACAssistant />} />
          <Route path="/capture" element={<OACAssistant />} />
          <Route path="/relationship" element={<Relationship360 />} />
          <Route path="/relationship/:id" element={<Relationship360 />} />
          <Route path="/meeting" element={<MeetingRecorder />} />
          <Route path="/email" element={<EmailAssistant />} />
          <Route path="/report" element={<ReportGenerator />} />
          <Route path="/data" element={<DataInsight />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </ToastProvider>
    </AiSettingsProvider>
    </CaptureProvider>
    </LanguageProvider>
    </ThemeProvider>
  )
}
