// src/hooks/useGarmentForm.js — shared garment-builder state for GuidedWalkthrough
// (Path A) and DirectForm (Path B). Both read the same src/data/orderConfig.js catalog
// and previously reimplemented this state + derivation layer independently.
import { useMemo, useState } from 'react'
import { FITS, hemsFor, showFor, colorsFor, quoteTotals, MIN_QTY } from '../data/orderConfig.js'

export const DEFAULT_GARMENT_FORM = {
  style: 'plain-tee', fit: 'Standard', size: 'M',
  collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
  fabric: 'CVC 240 GSM', color: 'Black',
  printChoice: 'has', printColors: 1, placement: 'Front only', qty: MIN_QTY,
}

/**
 * @param {object|(() => object)} [initialForm] - defaults to DEFAULT_GARMENT_FORM; pass
 *   a value or lazy initializer (e.g. DirectForm seeding from a stashed reorder).
 */
export function useGarmentForm(initialForm = DEFAULT_GARMENT_FORM) {
  const [form, setForm] = useState(initialForm)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const sh = useMemo(() => showFor(form.style, form.printChoice), [form.style, form.printChoice])
  const hasDesign = sh.printDesign

  // Keep dependent fields valid when style/fabric change.
  const pickStyle = (id) => {
    const s = showFor(id, form.printChoice)
    const nextHems = hemsFor(id)
    set({
      style: id,
      fit: s.isPant ? form.fit : (FITS.includes(form.fit) ? form.fit : 'Standard'),
      hem: nextHems.some((h) => h.label === form.hem) ? form.hem : nextHems[0].label,
    })
  }
  const pickFabric = (value) => {
    const avail = colorsFor(value)
    set({ fabric: value, color: avail.includes(form.color) ? form.color : (avail[0] || form.color) })
  }

  const totals = quoteTotals({ ...form, hasDesign }, form.qty)

  return { form, set, sh, hasDesign, pickStyle, pickFabric, totals }
}
