// src/api/client.js — thin fetch wrapper for the real Laravel backend (Sanctum bearer tokens).
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'sorbetes_api_token'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function messageFor(data, fallback) {
  const firstFieldError = Object.values(data?.errors || {})[0]?.[0]
  return firstFieldError || data?.message || fallback
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  // FormData (file uploads) must NOT get a manual Content-Type — the browser sets
  // its own with the multipart boundary. Setting it ourselves breaks the upload.
  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : (isFormData ? body : JSON.stringify(body)),
    })
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0, null)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(messageFor(data, 'Something went wrong. Please try again.'), res.status, data)
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
