import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/render'
import { DueAlerts } from './DueAlerts'

const entry = (todos: { id: string; text: string; due: string }[]) => ({
  id: 'e1', accountId: 'agoda', accountName: 'Agoda', category: 'Partner',
  detectedContext: 'API', isExisting: true, date: '2026-06-05', rawText: 'x', summary: 's',
  timeline: { date: '2026-06-05', title: 't', detail: 'd' },
  todos: todos.map((t) => ({ ...t, priority: 'High', done: false })), risks: [],
})

describe('DueAlerts', () => {
  beforeEach(() => localStorage.clear())

  it('renders no banner when there are no open to-dos', () => {
    localStorage.setItem('oac-captures-v1', JSON.stringify([entry([])]))
    renderWithProviders(<DueAlerts />)
    expect(screen.queryByText(/Due & overdue|마감·연체/)).not.toBeInTheDocument()
  })

  it('surfaces overdue / due-soon to-dos but hides far-future ones', () => {
    localStorage.setItem('oac-captures-v1', JSON.stringify([
      entry([
        { id: 't1', text: 'Send overdue contract', due: '2020-01-01' }, // long past → overdue
        { id: 't2', text: 'Quarterly review later', due: '2099-12-31' }, // far future → excluded
      ]),
    ]))
    renderWithProviders(<DueAlerts />)
    // the banner shows (title is language-dependent, match either)
    expect(screen.getByText(/Due & overdue|마감·연체/)).toBeInTheDocument()
    expect(screen.getByText('Send overdue contract')).toBeInTheDocument()
    expect(screen.queryByText('Quarterly review later')).not.toBeInTheDocument()
  })
})
