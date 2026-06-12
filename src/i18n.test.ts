import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { I18N_DICT, I18N_KEYS } from './i18n'

// C-4: i18n coverage. Every t('literal-key') in the source must resolve to a real
// dictionary entry (otherwise t() falls back to the raw key, which ships visibly),
// and no entry may have an empty EN or KO string. Dynamic keys (t(variable)) are
// skipped — only string-literal calls are statically checkable.

function sourceFiles(): string[] {
  const root = join(process.cwd(), 'src')
  return (readdirSync(root, { recursive: true, encoding: 'utf8' }) as string[])
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f))
    .map((f) => join(root, f))
}

describe('i18n coverage', () => {
  it('every t() string-literal key exists in the dictionary', () => {
    // `t(` not preceded by an identifier char → the translation fn, not it()/parseInt()/etc.
    const re = /[^A-Za-z0-9_$.]t\(\s*['"]([^'"]+)['"]/g
    const missing: string[] = []
    for (const file of sourceFiles()) {
      // strip block + line comments so commented-out t('…') examples don't match
      const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      let m: RegExpExecArray | null
      while ((m = re.exec(src))) {
        if (!I18N_KEYS.has(m[1])) missing.push(`${m[1]}  (${file.split('src')[1]})`)
      }
    }
    expect(missing).toEqual([])
  })

  it('no dictionary entry has an empty EN or KO string', () => {
    const empties = Object.entries(I18N_DICT).filter(([, v]) => !v.en?.trim() || !v.ko?.trim()).map(([k]) => k)
    expect(empties).toEqual([])
  })
})
