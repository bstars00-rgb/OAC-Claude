import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('boom-xyz-123')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(<ErrorBoundary><p>all good</p></ErrorBoundary>)
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('shows a fallback (not a blank screen) when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Boom /></ErrorBoundary>)
    expect(screen.getByText(/Something went wrong|문제가 발생/)).toBeInTheDocument()
    // the error message is surfaced in the details block
    expect(screen.getByText(/boom-xyz-123/)).toBeInTheDocument()
    // and a recovery action exists
    expect(screen.getByRole('button', { name: /Retry|다시 시도/ })).toBeInTheDocument()
    spy.mockRestore()
  })

  it('recovers to children after Retry when the child no longer throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let crash = true
    const Toggle = () => (crash ? <Boom /> : <p>recovered</p>)
    render(<ErrorBoundary><Toggle /></ErrorBoundary>)
    expect(screen.getByText(/Something went wrong|문제가 발생/)).toBeInTheDocument()
    crash = false
    fireEvent.click(screen.getByRole('button', { name: /Retry|다시 시도/ }))
    expect(screen.getByText('recovered')).toBeInTheDocument()
    spy.mockRestore()
  })
})
