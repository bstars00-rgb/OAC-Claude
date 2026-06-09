import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { Dashboard } from './pages/Dashboard'
import { AskOAC } from './pages/AskOAC'
import { Relationship360 } from './pages/Relationship360'
import { MeetingRecorder } from './pages/MeetingRecorder'
import { EmailAssistant } from './pages/EmailAssistant'
import { ReportGenerator } from './pages/ReportGenerator'
import { DataInsight } from './pages/DataInsight'
import { Integrations } from './pages/Integrations'

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ask" element={<AskOAC />} />
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
  )
}
