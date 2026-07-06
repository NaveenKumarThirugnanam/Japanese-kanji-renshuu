import { useState, useEffect, useCallback } from 'react'
import { fetchKanjiRange } from '../api/kanji'
import StrokeOrder from './StrokeOrder'
import './Study.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildCards(kanjiList, mode) {
  const cards = []
  kanjiList.forEach(entry => {
    entry.compounds.forEach(({ word, reading }) => {
      let front, back, hint
      const effectiveMode = mode === 'mix'
        ? (Math.random() < 0.5 ? 'w2r' : 'r2w')
        : mode
      if (effectiveMode === 'r2w') {
        front = reading; back = word; hint = 'TAP TO REVEAL WORD'
      } else {
        front = word; back = reading; hint = 'TAP TO REVEAL READING'
      }
      cards.push({ front, back, hint, word, reading, kanji: entry.character, num: entry.number })
    })
  })
  return shuffle(cards)
}

export default function Study({ rangeFrom, rangeTo, mode, onComplete, onBack }) {
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [wrongCards, setWrongCards] = useState([])
  const [flipped, setFlipped] = useState(false)
  const [showStroke, setShowStroke] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchKanjiRange(rangeFrom, rangeTo)
      .then(data => {
        const results = data.results ?? data
        setCards(buildCards(results, mode))
        setLoading(false)
      })
      .catch(() => { setError('Failed to load kanji. Is the server running?'); setLoading(false) })
  }, [rangeFrom, rangeTo, mode])

  const flip = useCallback(() => { if (!flipped) setFlipped(true) }, [flipped])

  const answer = useCallback((ok) => {
    if (!flipped) return
    const next = idx + 1
    const newCorrect = ok ? correct + 1 : correct
    const newWrong = ok ? wrong : wrong + 1
    const newWrongCards = ok ? wrongCards : [...wrongCards, cards[idx]]

    if (next >= cards.length) {
      onComplete({
        cards,
        correct: newCorrect,
        wrong: newWrong,
        wrongCards: newWrongCards,
        rangeFrom,
        rangeTo,
      })
      return
    }

    setCorrect(newCorrect)
    setWrong(newWrong)
    setWrongCards(newWrongCards)
    setIdx(next)
    setFlipped(false)
    setShowStroke(false)
  }, [flipped, idx, correct, wrong, wrongCards, cards, onComplete, rangeFrom, rangeTo])

  useEffect(() => {
    function onKey(e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip() }
      if (e.key === 'ArrowRight' || e.key === 'j') answer(true)
      if (e.key === 'ArrowLeft' || e.key === 'f') answer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flip, answer])

  if (loading) return (
    <div className="study-loading">
      <span className="lk">漢</span>
      <div className="lt">LOADING...</div>
    </div>
  )

  if (error) return <div className="errbox" style={{ margin: 20 }}>{error}</div>

  const card = cards[idx]
  const total = cards.length
  const progress = total > 0 ? (idx / total) * 100 : 0

  return (
    <div className="study">
      <button className="back-btn" onClick={onBack}>← Range Select</button>

      <div className="stats">
        <div className="stat c"><span className="v">{correct}</span><span className="l">CORRECT</span></div>
        <div className="stat w"><span className="v">{wrong}</span><span className="l">WRONG</span></div>
        <div className="stat r"><span className="v">{Math.max(0, total - idx)}</span><span className="l">LEFT</span></div>
      </div>

      <div className="prog-wrap">
        <div className="prog-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="card-area">
        <div className="card-wrap" onClick={flip}>
          <div className={`card${flipped ? ' flipped' : ''}`}>
            <div className="face front">
              <div className="badge">#{card.num} {card.kanji}</div>
              <div className="fkanji">{card.front}</div>
              <div className="fhint">{card.hint}</div>
            </div>
            <div className="face back">
              <div className="badge">ANSWER</div>
              <div className="breading">{card.back}</div>
              <div className="bsource">{card.word} — {card.reading}</div>
              <button
                className="stroke-toggle"
                onClick={e => { e.stopPropagation(); setShowStroke(s => !s) }}
              >
                {showStroke ? '▲ Hide strokes' : '筆 Stroke order'}
              </button>
              {showStroke && <StrokeOrder character={card.kanji} />}
            </div>
          </div>
        </div>
      </div>

      {!flipped && <div className="tap-hint">tap card to reveal</div>}

      <div className="ans-row">
        <button className={`abtn awrong${!flipped ? ' ahidden' : ''}`} onClick={() => answer(false)}>✗ 間違い</button>
        <button className={`abtn acorrect${!flipped ? ' ahidden' : ''}`} onClick={() => answer(true)}>✓ 正解</button>
      </div>
    </div>
  )
}
