import { describe, it, expect } from 'vitest'
import { detectContext, allContextLabels } from './contextDetection'

describe('detectContext', () => {
  it('detects API integration', () => {
    expect(detectContext('possible API integration and channel expansion').label).toBe(
      'API Integration / Channel Expansion',
    )
  })

  it('detects SLA / contract risk', () => {
    expect(detectContext('SLA compensation and service level risk').label).toBe('SLA / Contract Risk')
  })

  it('detects prebook failure', () => {
    expect(detectContext('prebook No Room Available suspension threshold').label).toBe(
      'Prebook Failure / API Monitoring',
    )
  })

  it('falls back when no signal', () => {
    const r = detectContext('xyz qqq')
    expect(r.label).toBe('Strategic Partnership')
    expect(r.confidence).toBe(71)
  })

  it('confidence rises with more keyword hits', () => {
    expect(detectContext('api integration channel connect endpoint').confidence).toBeGreaterThan(
      detectContext('api').confidence,
    )
  })

  it('exposes the label list', () => {
    expect(allContextLabels().length).toBeGreaterThan(5)
  })
})
