// Client-side file export. No backend — everything is generated in the browser
// from the user's own data and saved via a user-initiated download.
//   • Word  → an HTML document served as application/msword (.doc)
//   • PDF   → a real downloaded .pdf via jsPDF + html2canvas (B-3). Rendered from
//             an off-screen hex-styled node so Korean/Japanese render correctly
//             (jsPDF's core fonts can't do CJK) and html2canvas never meets a
//             Tailwind oklch() color (which it can't parse).
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

/** Plain text (with newlines) → a real downloaded .pdf (Korean-safe, paginated). */
export async function exportTextAsPdf(title: string, text: string, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')])

  // Render the report into an off-screen node with ONLY inline hex styles, so
  // html2canvas rasterizes it with system fonts (CJK works) and never sees a
  // Tailwind oklch() color.
  const node = document.createElement('div')
  node.setAttribute('style', 'position:fixed;left:-10000px;top:0;width:720px;padding:32px;background:#ffffff;color:#1e293b;font-family:"Segoe UI",Arial,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word')
  node.textContent = text
  document.body.appendChild(node)
  try {
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 32
    const imgW = pageW - margin * 2
    const imgH = (canvas.height * imgW) / canvas.width
    const img = canvas.toDataURL('image/png')
    let remaining = imgH
    let y = margin
    // place the single tall image, shifting it up page by page
    while (remaining > 0) {
      pdf.addImage(img, 'PNG', margin, y, imgW, imgH)
      remaining -= pageH - margin * 2
      if (remaining > 0) { pdf.addPage(); y -= pageH - margin * 2 }
    }
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  } finally {
    node.remove()
  }
}

/** Serialize an SVG chart and download it as a PNG. */
export async function exportSvgAsPng(svg: SVGSVGElement, filename: string, scale = 2): Promise<void> {
  const rect = svg.getBoundingClientRect()
  const w = Math.max(1, rect.width || Number(svg.getAttribute('width')) || 320)
  const h = Math.max(1, rect.height || Number(svg.getAttribute('height')) || 180)
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  const data = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('svg load failed')); img.src = url })
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, w, h)
    await new Promise<void>((res) => canvas.toBlob((b) => { if (b) download(b, filename.endsWith('.png') ? filename : `${filename}.png`); res() }, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
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
