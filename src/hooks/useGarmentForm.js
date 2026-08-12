// src/hooks/useGarmentForm.js — shared garment-builder state for GuidedWalkthrough
// (Path A) and DirectForm (Path B). Both read the same src/data/orderConfig.js catalog
// and previously reimplemented this state + derivation layer independently.
import { useMemo, useState } from 'react'
import { FITS, hemsFor, showFor, quoteTotals, MIN_QTY, colorsForFabric } from '../data/orderConfig.js'

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
  // Color depends on fabric again as of 2026-08-12 (owner's explicit call, reversing the
  // 2026-08-11 "one universal list" note that used to be here) — each fabric now only
  // offers the colors in its own catalog-matched category pool (colorsForFabric()). So this
  // DOES need to revalidate on fabric change once more: if the current color isn't in the
  // new fabric's pool, fall back to that pool's first color. This is the same shape of
  // revalidation the 2026-08-11 fix removed for being buggy — the difference is the
  // restriction itself is intentional now, not an accidental smaller list, so resetting to
  // a real default here is correct instead of silently-losing-your-choice.
  const pickFabric = (value) => {
    const pool = colorsForFabric(value)
    const colorStillValid = pool.some((c) => c.name === form.color)
    set({ fabric: value, color: colorStillValid ? form.color : pool[0]?.name ?? form.color })
  }

  const totals = quoteTotals({ ...form, hasDesign }, form.qty)

  return { form, set, sh, hasDesign, pickStyle, pickFabric, totals }
}
