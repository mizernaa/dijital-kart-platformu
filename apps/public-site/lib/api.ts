const API_URL = process.env.API_URL || 'http://localhost:3001'

export async function fetchProfile(slug: string) {
  const res = await fetch(`${API_URL}/p/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

export async function trackEvent(slug: string, payload: {
  eventType: string
  source?: string
  buttonLabel?: string
}) {
  try {
    await fetch(`${API_URL}/p/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {}
}
