// src/api/auth.js — real auth calls against the Laravel backend (replaces src/mocks/auth.js).
import { api } from './client.js'

/** @returns {Promise<{token:string,user:object}>} */
export function registerAccount({ name, email, password }) {
  return api.post('/auth/register', { name, email, password }, { auth: false })
}

/** @returns {Promise<{token:string,user:object}>} */
export function loginAccount({ email, password }) {
  return api.post('/auth/login', { email, password }, { auth: false })
}

/** @returns {Promise<{user:object}>} */
export function fetchMe() {
  return api.get('/auth/me')
}
