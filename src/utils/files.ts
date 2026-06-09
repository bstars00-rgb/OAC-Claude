// File handling for the assistant composer: read images/documents/text,
// classify them, and prepare them for the Anthropic API (base64 / text).

export type AttachmentKind = 'image' | 'pdf' | 'text' | 'other'

export interface Attachment {
  id: string
  name: string
  size: number
  kind: AttachmentKind
  mediaType: string
  dataBase64?: string // for image / pdf
  text?: string // for text files
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const TEXT_EXT = ['.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.log', '.yml', '.yaml']

let seq = 0
const newId = () => `att-${Date.now().toString(36)}-${seq++}`

const normalizeImageType = (t: string): string => (t === 'image/jpg' ? 'image/jpeg' : t)

const readDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })

const readText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsText(file)
  })

const stripDataUrl = (dataUrl: string): string => dataUrl.split(',')[1] ?? ''

export const classify = (file: File): AttachmentKind => {
  if (IMAGE_TYPES.includes(file.type)) return 'image'
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf'
  const lower = file.name.toLowerCase()
  if (file.type.startsWith('text/') || TEXT_EXT.some((e) => lower.endsWith(e))) return 'text'
  return 'other'
}

export const readAttachment = async (file: File): Promise<Attachment> => {
  const kind = classify(file)
  const base: Attachment = {
    id: newId(),
    name: file.name,
    size: file.size,
    kind,
    mediaType: file.type || 'application/octet-stream',
  }
  if (kind === 'image') {
    base.mediaType = normalizeImageType(file.type)
    base.dataBase64 = stripDataUrl(await readDataUrl(file))
  } else if (kind === 'pdf') {
    base.mediaType = 'application/pdf'
    base.dataBase64 = stripDataUrl(await readDataUrl(file))
  } else if (kind === 'text') {
    base.text = (await readText(file)).slice(0, 20000) // cap embedded text
  }
  return base
}

export const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
