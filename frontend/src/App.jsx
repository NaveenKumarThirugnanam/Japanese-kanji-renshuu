import { useState, useCallback } from 'react'
import Header from './components/Header'
import Setup from './components/Setup'
import Study from './components/Study'
import Complete from './components/Complete'
import Search from './components/Search'
import { useProgress } from './hooks/useProgress'
import { postSession } from './api/kanji'
import './App.css'

function getClientId() {
  const KEY = 'n2kanji_client_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export default function App() {
  const [tab, setTab] = useState('study')          // 'study' | 'dict'
  const [screen, setScreen] = useState('setup')    // setup | study | complete
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const { progress, saveRange } = useProgress()

  const handleStart = useCallback((from, to, mode) => {
    setSession({ from, to, mode })
    setScreen('study')
  }, [])

  const handleComplete = useCallback((res) => {
    saveRange(res.rangeFrom, res.rangeTo, res.cards.length)
    setResult(res)
    setScreen('complete')
    postSession({
      client_id: getClientId(),
      range_from: res.rangeFrom,
      range_to: res.rangeTo,
      mode: session?.mode ?? 'w2r',
      total: res.cards.length,
      correct: res.correct,
    }).catch(() => {})
  }, [saveRange, session])

  const handleRetryWrong = useCallback(() => { setScreen('study') }, [])
  const handleRestart    = useCallback(() => { setScreen('study') }, [])

  return (
    <div className="app">
      <Header tab={tab} onTab={setTab} />

      {tab === 'dict' && (
        <div className="dict-page">
          <div className="dict-pg-head">
            <span className="dict-pg-title">漢字辞典 — Kanji Dictionary</span>
            <span className="dict-pg-count">1,046 ENTRIES · N2</span>
          </div>
          <Search />
        </div>
      )}

      {tab === 'study' && (
        <>
          {screen === 'setup' && (
            <Setup progress={progress} onStart={handleStart} />
          )}
          {screen === 'study' && session && (
            <Study
              key={`${session.from}-${session.to}-${Date.now()}`}
              rangeFrom={session.from}
              rangeTo={session.to}
              mode={session.mode}
              onComplete={handleComplete}
              onBack={() => setScreen('setup')}
            />
          )}
          {screen === 'complete' && result && (
            <Complete
              result={result}
              onRetryWrong={handleRetryWrong}
              onRestart={handleRestart}
              onBack={() => setScreen('setup')}
            />
          )}
        </>
      )}
    </div>
  )
}
