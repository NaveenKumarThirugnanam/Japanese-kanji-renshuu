import { useState, useCallback } from 'react'
import { toHiragana } from 'wanakana'
import { searchKanji } from '../api/kanji'
import StrokeOrder from './StrokeOrder'
import './Search.css'

function highlight(text, q) {
  if (!q) return text
  try {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return text.replace(new RegExp(safe, 'g'), m => `<mark>${m}</mark>`)
  } catch {
    return text
  }
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [openStroke, setOpenStroke] = useState(null)  // entry.number | null

  const handleInput = useCallback(async (val) => {
    setQuery(val)
    setOpenStroke(null)
    if (!val.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const data = await searchKanji(val)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function toggleStroke(num) {
    setOpenStroke(prev => prev === num ? null : num)
  }

  return (
    <div className="search-wrap">
      <div className="slabel">▸ SEARCH KANJI / READING</div>
      <div className="search-row">
        <input
          className="search-inp"
          type="text"
          value={query}
          placeholder="漢字・ひらがな…"
          onChange={e => handleInput(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className="cbtn" onClick={() => { setQuery(''); setResults([]); setOpenStroke(null) }}>✕</button>
      </div>

      {query && (
        <div className="sr-count">
          {loading ? 'SEARCHING…' : results.length ? `${results.length} RESULT${results.length > 1 ? 'S' : ''}` : ''}
        </div>
      )}

      <div className="search-results">
        {!loading && query && results.length === 0 && (
          <div className="sr-none">— NO RESULTS —</div>
        )}
        {results.map(entry => (
          <div key={entry.number} className="sr-entry">
            <div className="sr-head">
              <span className="sr-num">#{entry.number}</span>
              <span className="sr-kanji">{entry.character}</span>
              <button
                className={`sr-so-btn${openStroke === entry.number ? ' active' : ''}`}
                onClick={() => toggleStroke(entry.number)}
              >
                {openStroke === entry.number ? '▼ 筆順' : '筆 Stroke'}
              </button>
            </div>
            <div>
              {entry.compounds.map((c, i) => (
                <div key={i} className="sr-word">
                  <span dangerouslySetInnerHTML={{ __html: highlight(c.word, toHiragana(query)) }} />
                  <span className="sr-read" dangerouslySetInnerHTML={{ __html: highlight(c.reading, toHiragana(query)) }} />
                </div>
              ))}
            </div>
            {openStroke === entry.number && (
              <StrokeOrder character={entry.character} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
