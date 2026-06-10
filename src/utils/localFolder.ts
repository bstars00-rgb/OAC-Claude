// Local folder connection via the File System Access API (Chrome/Edge).
// The user grants OAC read access to their REPORT folder ONCE; the directory
// handle is persisted in IndexedDB so OAC can re-read the latest weekly files
// later — no Microsoft permission, no upload, fully local.

export const supportsLocalFolder = typeof window !== 'undefined' && 'showDirectoryPicker' in window

// ── persist the directory handle in IndexedDB ────────────────────────────────
const DB_NAME = 'oac-fs'
const STORE = 'handles'
const KEY = 'reportFolder'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbPut(handle: unknown): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(handle, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function idbGet(): Promise<any | null> {
  const db = await openDb()
  const res = await new Promise<any | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const r = tx.objectStore(STORE).get(KEY)
    r.onsuccess = () => resolve(r.result ?? null)
    r.onerror = () => reject(r.error)
  })
  db.close()
  return res
}

async function idbDel(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
  })
  db.close()
}

// ── permissions ──────────────────────────────────────────────────────────────
async function ensureRead(handle: any): Promise<boolean> {
  const opts = { mode: 'read' as const }
  if ((await handle.queryPermission?.(opts)) === 'granted') return true
  return (await handle.requestPermission?.(opts)) === 'granted'
}

/** Show the folder picker, save the handle, return the folder name. */
export async function pickFolder(): Promise<string> {
  const handle = await (window as any).showDirectoryPicker({ mode: 'read' })
  await idbPut(handle)
  return handle.name as string
}

/** The connected folder's name (no prompt), or null. */
export async function connectedFolderName(): Promise<string | null> {
  try {
    const handle = await idbGet()
    return handle?.name ?? null
  } catch {
    return null
  }
}

export async function disconnectFolder(): Promise<void> {
  try {
    await idbDel()
  } catch {
    /* ignore */
  }
}

// ── read the latest RawData files from the folder ────────────────────────────
async function* walk(dir: any, prefix = ''): AsyncGenerator<{ name: string; path: string; entry: any }> {
  for await (const [name, entry] of dir.entries()) {
    if (entry.kind === 'file') yield { name, path: prefix + name, entry }
    else if (entry.kind === 'directory') yield* walk(entry, prefix + name + '/')
  }
}

/** Find the most recent Booking / Check Out spreadsheets inside the connected folder. */
export async function findRawDataFiles(): Promise<{ booking?: File; checkout?: File }> {
  const handle = await idbGet()
  if (!handle) throw new Error('연결된 폴더가 없습니다. 먼저 폴더를 연결하세요.')
  if (!(await ensureRead(handle))) throw new Error('폴더 읽기 권한이 거부되었습니다.')

  const files: { file: File; path: string }[] = []
  for await (const f of walk(handle)) {
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) continue
    try {
      const file: File = await f.entry.getFile()
      files.push({ file, path: f.path })
    } catch {
      /* skip unreadable */
    }
  }
  // Classify by the containing FOLDER (not the filename) — both files are often
  // named "Hotel Booking List…", so the folder disambiguates booking vs check-out.
  const dirOf = (p: string) => { const i = p.lastIndexOf('/'); return i >= 0 ? p.slice(0, i) : '' }
  const latest = (re: RegExp): File | undefined =>
    files
      .filter((x) => { const d = dirOf(x.path); return d ? re.test(d) : re.test(x.file.name) })
      .sort((a, b) => b.file.lastModified - a.file.lastModified)[0]?.file
  return { booking: latest(/booking/i), checkout: latest(/check\s*-?\s*out|checkout/i) }
}
