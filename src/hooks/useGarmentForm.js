// src/hooks/useGarmentForm.js — shared garment-builder state for GuidedWalkthrough
// (Path A) and DirectForm (Path B). Both read the same src/data/orderConfig.js catalog
// and previously reimplemented this state + derivation layer independently.
import { useMemo, useState } from 'react'
import { FITS, hemsFor, showFor, quoteTotals, MIN_QTY } from '../data/orderConfig.js'

export const DEFAULT_GARMENT_FORM = {
  style: 'plain-tee', fit: 'Standard', size: 'M',
  collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
  fabric: 'CVC 240 GSM', color: 'Black',
  printChoice: 'has', printColors: 1, printColorsBack: 1, placement: 'Front only', qty: MIN_QTY,
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
  // Color no longer depends on fabric — all three ordering paths pick from the same
  // 20-color SHIRT_COLORS list (data/orderConfig.js) regardless of fabric/GSM, so there's
  // nothing left to revalidate here. (This also fixes a real bug this used to have: it
  // reset the customer's color choice to the old, smaller per-fabric list's first color
  // whenever fabric changed, discarding anything outside that shorter list — including on
  // WalkInForm, which already only ever offered the full 20-color list.)
  const pickFabric = (value) => set({ fabric: value })

  const totals = quoteTotals({ ...form, hasDesign }, form.qty)

  return { form, set, sh, hasDesign, pickStyle, pickFabric, totals }
}
