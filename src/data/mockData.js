// src/data/mockData.js
// Seed/fake data for the frontend-only build. Every consumer of this data is a mock;
// real values come from the backend once it exists (see src/mocks/*).

import { quoteTotals } from './orderConfig.js'

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString()

// ---- Fake Google OAuth profiles ------------------------------------------
// TODO: replace with real Google OAuth profile — see FRONTEND-BUILD-SPEC.md §2/§3.
export const FAKE_GOOGLE_PROFILES = [
  {
    id: 'g_1088231',
    name: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    picture: '', // avatar falls back to initials in the UI
    provider: 'google',
  },
  {
    id: 'g_2277841',
    name: 'Josh Reyes',
    email: 'josh.reyes@gmail.com',
    picture: '',
    provider: 'google',
  },
]
export const DEFAULT_PROFILE = FAKE_GOOGLE_PROFILES[0]

// ---- helper to shape a seed order consistently with the live store -------
function seedOrder({ id, ref, path, status, form, qty, customer, createdDaysAgo, timeline, payments = [], extra = {} }) {
  const totals = quoteTotals(form, qty)
  return {
    id,
    ref,
    path, // 'guided' | 'instant' | 'walkin'
    status,
    form,
    qty,
    totals,
    customer,
    payments, // { type:'sampleFee'|'dp'|'bal', amount, channel, ref, proofName, status, reason, at }
    timeline, // { status, at, note }
    createdAt: createdDaysAgo != null ? daysAgo(createdDaysAgo) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  }
}

// ---- Seed orders (various states) for the signed-in dashboard ------------
export const SEED_ORDERS = [
  seedOrder({
    id: 'ord_1001',
    ref: 'SB-2601',
    path: 'instant',
    status: 'downpayment_to_pay',
    qty: 120,
    customer: { name: 'Maria Santos', email: 'maria.santos@gmail.com', phone: '+63 917 555 0101' },
    form: {
      style: 'printed-tee', fit: 'Oversized', size: 'L',
      collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
      fabric: 'CVC 280 GSM', color: 'Black',
      hasDesign: true, printColors: 2, placement: 'Front + back',
    },
    createdDaysAgo: 6,
    payments: [
      { type: 'sampleFee', amount: 1000, channel: 'GCash', ref: 'GC-884120', proofName: 'gcash-receipt.jpg', status: 'approved', at: daysAgo(5) },
    ],
    timeline: [
      { status: 'waiting_for_seller', at: daysAgo(6), note: 'Order placed via Instant builder' },
      { status: 'sample_fee_to_pay', at: daysAgo(6), note: 'Seller accepted — sample fee requested' },
      { status: 'sample_fee_review', at: daysAgo(5), note: 'Proof submitted (GCash GC-884120)' },
      { status: 'sample_production', at: daysAgo(5), note: 'Payment verified — sample started' },
      { status: 'sample_approval', at: daysAgo(2), note: 'Sample ready for review' },
      { status: 'downpayment_to_pay', at: daysAgo(1), note: 'Sample approved (no changes)' },
    ],
  }),
  seedOrder({
    id: 'ord_1002',
    ref: 'SB-2588',
    path: 'guided',
    status: 'in_production',
    qty: 200,
    customer: { name: 'Maria Santos', email: 'maria.santos@gmail.com', phone: '+63 917 555 0101' },
    form: {
      style: 'hoodie', fit: 'Standard', size: 'M',
      collar: 'Standard ribbed crew', sleeve: 'Ribbed cuff', hem: 'Standard open hem',
      fabric: 'Premium 280 GSM', color: 'Olive',
      hasDesign: true, printColors: 1, placement: 'Front only',
    },
    createdDaysAgo: 14,
    payments: [
      { type: 'sampleFee', amount: 1000, channel: 'Bank Transfer', ref: 'BPI-556677', proofName: 'bank-slip.pdf', status: 'approved', at: daysAgo(13) },
      { type: 'dp', amount: 0, channel: 'Maya', ref: 'MY-330099', proofName: 'maya-receipt.jpg', status: 'approved', at: daysAgo(8) },
    ],
    timeline: [
      { status: 'waiting_for_seller', at: daysAgo(14), note: 'Order placed via Guided walkthrough' },
      { status: 'sample_fee_to_pay', at: daysAgo(14), note: 'Sample fee requested' },
      { status: 'sample_fee_review', at: daysAgo(13), note: 'Proof submitted' },
      { status: 'sample_production', at: daysAgo(13), note: 'Sample started' },
      { status: 'sample_approval', at: daysAgo(10), note: 'Sample ready' },
      { status: 'downpayment_to_pay', at: daysAgo(9), note: 'Minor change fixed in-house' },
      { status: 'downpayment_review', at: daysAgo(8), note: 'Downpayment proof submitted' },
      { status: 'in_production', at: daysAgo(8), note: 'Downpayment verified — bulk production' },
    ],
  }),
  seedOrder({
    id: 'ord_1003',
    ref: 'SB-2544',
    path: 'walkin',
    status: 'delivered',
    qty: 80,
    customer: { name: 'Josh Reyes', email: 'josh.reyes@gmail.com', phone: '+63 917 555 0199' },
    form: {
      style: 'plain-tee', fit: 'Boxy', size: 'XL',
      collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard straight hem',
      fabric: 'CVC 240 GSM', color: 'White',
      hasDesign: false, printColors: 1, placement: 'Front only',
    },
    createdDaysAgo: 30,
    payments: [
      { type: 'sampleFee', amount: 1000, channel: 'Cash', ref: 'COUNTER', proofName: null, status: 'approved', at: daysAgo(29) },
      { type: 'dp', amount: 0, channel: 'Cash', ref: 'COUNTER', proofName: null, status: 'approved', at: daysAgo(22) },
      { type: 'bal', amount: 0, channel: 'Cash', ref: 'COUNTER', proofName: null, status: 'approved', at: daysAgo(3) },
    ],
    timeline: [
      { status: 'waiting_for_seller', at: daysAgo(30), note: 'Walk-in order (in-store)' },
      { status: 'delivered', at: daysAgo(3), note: 'Picked up in store — fully paid (cash)' },
    ],
  }),
]

// ---- Portfolio case studies (Phase 5 marketing) --------------------------
export const PORTFOLIO = [
  { id: 'p1', brand: 'Kalye Supply', category: 'Streetwear brands', qty: 300, style: 'Oversized printed tee', fabric: 'CVC 280 GSM', colors: 3, blurb: '3-color front + back run on heavyweight cotton.' },
  { id: 'p2', brand: 'Metro FC', category: 'Team & org merch', qty: 220, style: 'Performance tee', fabric: 'CVC 240 GSM', colors: 2, blurb: 'Roster-numbered team kit, quick turnaround.' },
  { id: 'p3', brand: 'Alon Coffee', category: 'Corporate uniforms', qty: 90, style: 'Premium tee', fabric: 'Premium 280 GSM', colors: 1, blurb: 'Staff uniforms with woven neck label.' },
  { id: 'p4', brand: 'Barrio Run Club', category: 'Event merch', qty: 500, style: 'Plain + print tee', fabric: '220 GSM', colors: 2, blurb: 'Race-day drop, 500 pcs across 6 sizes.' },
  { id: 'p5', brand: 'Studio Nine', category: 'Streetwear brands', qty: 150, style: 'Pullover hoodie', fabric: 'Premium 280 GSM', colors: 1, blurb: 'Embroidered-look 1-color hoodie capsule.' },
  { id: 'p6', brand: 'Live-selling brands', category: 'Live-selling brands', qty: 0, style: '', fabric: '', colors: 0, blurb: '', empty: true },
]
