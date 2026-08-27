import { toHiragana } from 'wanakana'

const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export async function fetchRanges() {
  return get('/kanji/ranges/')
}

export async function fetchKanjiRange(from, to) {
  return get(`/kanji/?from=${from}&to=${to}&page_size=200`)
}

export async function searchKanji(q) {
  const trimmed = q.trim()
  if (!trimmed) return []
  return get(`/kanji/search/?q=${encodeURIComponent(toHiragana(trimmed))}`)
}

export async function fetchStrokeOrder(character) {
  return get(`/kanji/stroke/?character=${encodeURIComponent(character)}`)
}

export async function postSession(session) {
  const res = await fetch(`${BASE}/sessions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}
