import { useState, useEffect } from 'react'
import { fetchRanges } from '../api/kanji'
import './Setup.css'

const MODES = [
  { id: 'w2r', label: 'Word → Reading' },
  { id: 'r2w', label: 'Reading → Word' },
  { id: 'mix', label: 'Mixed' },
]

export default function Setup({ progress, onStart }) {
  const [ranges, setRanges] = useState([])
  const [mode, setMode] = useState('w2r')
  const [selected, setSelected] = useState(null)
  const [customFrom, setCustomFrom] = useState(1)
  const [customTo, setCustomTo] = useState(50)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRanges().then(setRanges).catch(() => setError('Failed to load ranges from server.'))
  }, [])

  function handleSelect(range) {
    setSelected(range)
    setError('')
  }

  function handleStart() {
    if (!selected) return
    onStart(selected.from, selected.to, mode)
  }

  function handleCustom() {
    const a = parseInt(customFrom, 10)
    const b = parseInt(customTo, 10)
    if (isNaN(a) || isNaN(b) || a < 1 || b > 1046 || a > b) {
      setError('Enter a valid range (1–1046).')
      return
    }
    onStart(a, b, mode)
  }

  return (
    <div className="setup">
      <div className="slabel">▸ STUDY MODE</div>
      <div className="mode-row">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`modbtn${mode === m.id ? ' act' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="slabel">▸ SELECT RANGE</div>
      <div className="range-grid">
        {ranges.map(r => {
          const key = `${r.from}-${r.to}`
          const done = progress[key]
          const isSel = selected?.from === r.from && selected?.to === r.to
          return (
            <button
              key={key}
              className={`rb${isSel ? ' sel' : ''}${done ? ' done' : ''}`}
              onClick={() => handleSelect(r)}
            >
              {r.from}–{r.to}
              <small>{done ? `${done} cards` : ''}</small>
            </button>
          )
        })}
      </div>

      <div className="custom-row">
        <label>CUSTOM</label>
        <label>From</label>
        <input type="number" value={customFrom} min={1} max={1046} onChange={e => setCustomFrom(e.target.value)} />
        <label>To</label>
        <input type="number" value={customTo} min={1} max={1046} onChange={e => setCustomTo(e.target.value)} />
        <button className="cbtn" onClick={handleCustom}>Go</button>
      </div>

      <button className="mbtn" disabled={!selected} onClick={handleStart}>
        始めましょう — Start
      </button>

      {error && <div className="errbox">{error}</div>}
    </div>
  )
}
