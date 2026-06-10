import { describe, it, expect } from 'vitest'
import { normalizeSupabaseUrl, isConfigured } from './supabaseClient'

describe('normalizeSupabaseUrl', () => {
  it('keeps a correct project URL', () => {
    expect(normalizeSupabaseUrl('https://abcd1234.supabase.co')).toBe('https://abcd1234.supabase.co')
  })
  it('converts a dashboard URL to the API URL', () => {
    expect(normalizeSupabaseUrl('https://supabase.com/dashboard/project/abcd1234')).toBe('https://abcd1234.supabase.co')
    expect(normalizeSupabaseUrl('https://supabase.com/dashboard/project/abcd1234/settings/api')).toBe('https://abcd1234.supabase.co')
  })
  it('strips trailing slash and extra path', () => {
    expect(normalizeSupabaseUrl('https://abcd1234.supabase.co/')).toBe('https://abcd1234.supabase.co')
    expect(normalizeSupabaseUrl('https://abcd1234.supabase.co/rest/v1')).toBe('https://abcd1234.supabase.co')
  })
  it('adds a missing scheme', () => {
    expect(normalizeSupabaseUrl('abcd1234.supabase.co')).toBe('https://abcd1234.supabase.co')
  })
  it('isConfigured accepts a dashboard URL once a key is present', () => {
    expect(isConfigured({ url: 'https://supabase.com/dashboard/project/abcd1234', anonKey: 'sb_publishable_' + 'x'.repeat(30) })).toBe(true)
    expect(isConfigured({ url: '', anonKey: '' })).toBe(false)
  })
})
