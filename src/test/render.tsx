import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme'
import { LanguageProvider } from '../i18n'
import { CaptureProvider } from '../data/captureStore'
import { DatasetProvider } from '../data/datasetStore'
import { AiSettingsProvider } from '../utils/aiSettings'
import { ToastProvider } from '../components/Toast'

// Render a component inside the same provider stack the app uses, plus a router.
// Seed localStorage BEFORE calling this to control captures/datasets/lang.
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <LanguageProvider>
          <AiSettingsProvider>
            <CaptureProvider>
              <DatasetProvider>
                <ToastProvider>{children}</ToastProvider>
              </DatasetProvider>
            </CaptureProvider>
          </AiSettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
  return render(ui, { wrapper: Wrapper })
}
