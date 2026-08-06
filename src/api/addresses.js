// src/api/addresses.js — real, server-backed saved delivery addresses.
// Replaces the old localStorage-only mock (see src/pages/Address.jsx history).
import { api } from './client.js'

export function listAddresses() {
  return api.get('/addresses').then((r) => r.addresses)
}

export function createAddress({ label, recipient, line, city, phone }) {
  return api.post('/addresses', { label: label || null, recipient, line, city, phone }).then((r) => r.address)
}

export function makeDefaultAddress(id) {
  return api.patch(`/addresses/${id}/default`, {}).then((r) => r.address)
}

export function deleteAddress(id) {
  return api.delete(`/addresses/${id}`).then((r) => r.ok)
}
