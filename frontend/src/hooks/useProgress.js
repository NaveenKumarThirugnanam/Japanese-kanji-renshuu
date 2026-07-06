import { useState, useCallback } from 'react'

const STORAGE_KEY = 'n2kanji_progress_v2'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export function useProgress() {
  const [progress, setProgress] = useState(load)

  const saveRange = useCallback((from, to, cardCount) => {
    setProgress(prev => {
      const next = { ...prev, [`${from}-${to}`]: cardCount }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { progress, saveRange }
}
