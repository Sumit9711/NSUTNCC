const API_BASE = ''  // Proxy handles routing to Flask

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',  // send cookies for session auth
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Auth API ────────────────────────────────────────
export const authApi = {
  signup: (data) =>
    apiFetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  signin: (data) =>
    apiFetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch('/auth/me'),

  forgotPassword: (data) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  resetPassword: (data) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  makeAdmin: (dli_number) =>
    apiFetch('/auth/make-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dli_number }),
    }),
}

// ── Attendance API ──────────────────────────────────
export const attendanceApi = {
  getCadets: (year) => apiFetch(`/attendance/cadets?year=${year}`),

  getSessions: (year, month) =>
    apiFetch(`/attendance/sessions?year=${year}&month=${month}`),

  addSession: (date, notes) =>
    apiFetch('/attendance/sessions/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, notes }),
    }),

  getRecords: (sessionId, year) =>
    apiFetch(`/attendance/records?session_id=${sessionId}&year=${year}`),

  markAttendance: (sessionId, records) =>
    apiFetch('/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, records }),
    }),

  getAnalytics: (calYear, month, cadetYear) =>
    apiFetch(`/attendance/analytics?year=${calYear}&month=${month}&cadet_year=${cadetYear}`),

  getSessionPhotos: (sessionId) =>
    apiFetch(`/attendance/sessions/${sessionId}/photos`),

  uploadSessionPhotos: (sessionId, files) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('photos', f))
    return apiFetch(`/attendance/sessions/${sessionId}/photos/upload`, {
      method: 'POST',
      body: fd,
    })
  },

  deletePhoto: (photoId) =>
    apiFetch(`/attendance/sessions/photos/${photoId}`, { method: 'DELETE' }),

  deleteSession: (sessionId) =>
    apiFetch(`/attendance/sessions/${sessionId}`, { method: 'DELETE' }),

  // Cadet's own attendance
  getMyAttendance: () => apiFetch('/api/my-attendance'),
}

// ── Nominal Roll API ────────────────────────────────
export const nominalRollApi = {
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiFetch('/admin/nominal-roll/upload', { method: 'POST', body: fd })
  },

  generate: async (data) => {
    const res = await fetch(`${API_BASE}/admin/nominal-roll/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Download failed' }))
      throw new Error(err.error)
    }
    return res.blob()
  },
}

// ── Ranks API ──────────────────────────────────────
export const ranksApi = {
  getRanks: (session) => apiFetch(`/api/ranks${session ? `?session=${session}` : ''}`),
}

// ── Cadets API ────────────────────────────────────
export const cadetsApi = {
  getCadets: (year) => apiFetch(`/api/cadets${year ? `?year=${year}` : ''}`),
}

// ── Camps API ─────────────────────────────────────
export const campsApi = {
  getCamps: () => apiFetch('/api/camps'),
  getCampGallery: (campName) => apiFetch(`/api/camp/${campName}`),
}
