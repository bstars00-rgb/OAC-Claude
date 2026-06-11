// C-8: client-side file export. No backend — everything is generated in the
// browser from the user's own data and saved via a user-initiated download.
//   • Word  → an HTML document served as application/msword (.doc)
//   • PDF   → a print window the user saves as PDF (no extra dependency)
//   • Excel → a real .xlsx workbook via SheetJS (lazy-imported)

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Plain text (with newlines) → a Word-openable .doc file. */
export function exportTextAsWord(title: string, text: string, filename: string): void {
  const body = escapeHtml(text).replace(/\n/g, '<br>')
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body style="font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;line-height:1.5;color:#1e293b">${body}</body></html>`
  download(new Blob(['﻿', html], { type: 'application/msword' }), filename.endsWith('.doc') ? filename : `${filename}.doc`)
}

/** Plain text → a print window the user can "Save as PDF". */
export function exportTextAsPdf(title: string, text: string): boolean {
  const w = window.open('', '_blank')
  if (!w) return false // popup blocked
  const body = escapeHtml(text).replace(/\n/g, '<br>')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#1e293b;padding:32px;max-width:760px;margin:0 auto}h1{font-size:18px}@media print{body{padding:0}}</style></head><body>${body}<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`)
  w.document.close()
  return true
}

export interface ExcelSheet {
  name: string
  rows: Record<string, string | number>[]
}

/** One or more sheets of row objects → a downloaded .xlsx workbook. */
export async function exportExcel(sheets: ExcelSheet[], filename: string): Promise<void> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows.length ? sheet.rows : [{}])
    // Excel sheet names cap at 31 chars and forbid a few characters.
    const safe = sheet.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet'
    XLSX.utils.book_append_sheet(wb, ws, safe)
  }
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  download(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}
