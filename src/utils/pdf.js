// src/utils/pdf.js — turns the same plain-text quote already built for "Copy quote" into a
// real, directly downloadable PDF file. Previously "Save as PDF" just called window.print()
// and relied on the customer picking "Save as PDF" in their own browser's print dialog — the
// owner asked for an actual file download instead, no print dialog involved.
import { jsPDF } from 'jspdf'

const MARGIN = 18
const LINE_HEIGHT = 6
const PAGE_BOTTOM = 279 // A4 (297mm tall) minus a bottom margin

/**
 * jsPDF's built-in fonts (Helvetica/Times/Courier) only support WinAnsiEncoding — the ₱
 * (Philippine peso, U+20B1) sign isn't in that set. Left as-is, jsPDF silently substitutes
 * a wrong glyph (renders as "±") AND miscalculates that line's character spacing, so every
 * price line comes out both wrong and visibly stretched. Swapped for "PHP " here, in the
 * PDF only — the on-screen app and the "Copy quote" clipboard text are untouched, since
 * neither has this font limitation.
 */
const forPdf = (line) => line.replace(/₱/g, 'PHP ')

/** @param {string} text - same plain-text block the "Copy quote" button copies. */
export function downloadQuotePdf(text, filename) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  const nextLine = (extra = LINE_HEIGHT) => {
    y += extra
    if (y > PAGE_BOTTOM) {
      doc.addPage()
      y = MARGIN
    }
  }

  text.split('\n').forEach((rawLine, i) => {
    const line = forPdf(rawLine)
    if (i === 0) {
      // First line is always the "Sorbetes Apparel — ... Quotation" title from the two
      // buildXQuoteText() builders — set it apart as a real heading.
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(15)
      doc.text(line, MARGIN, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      nextLine(9)
      return
    }
    if (line === '') {
      nextLine(LINE_HEIGHT / 2)
      return
    }
    doc.text(line, MARGIN, y)
    nextLine()
  })

  doc.save(filename)
}
