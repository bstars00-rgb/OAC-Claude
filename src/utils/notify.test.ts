import { describe, it, expect, beforeEach } from 'vitest'
import { alreadyNotifiedToday, markNotified, notifyPermission } from './notify'

describe('notification de-dup', () => {
  beforeEach(() => localStorage.clear())

  it('is not notified before marking, and is after', () => {
    expect(alreadyNotifiedToday('due-daily')).toBe(false)
    markNotified('due-daily')
    expect(alreadyNotifiedToday('due-daily')).toBe(true)
  })

  it('re-arms when the stored date is not today', () => {
    localStorage.setItem('oac-notified-v1', JSON.stringify({ 'due-daily': '2020-01-01' }))
    expect(alreadyNotifiedToday('due-daily')).toBe(false) // stale → should fire again
  })

  it('prunes non-today keys on the next mark', () => {
    localStorage.setItem('oac-notified-v1', JSON.stringify({ old: '2020-01-01' }))
    markNotified('fresh')
    const stored = JSON.parse(localStorage.getItem('oac-notified-v1')!)
    expect(stored.old).toBeUndefined()
    expect(stored.fresh).toBeTruthy()
  })

  it('reports unsupported when Notification is absent (jsdom)', () => {
    expect(notifyPermission()).toBe('unsupported')
  })
})
