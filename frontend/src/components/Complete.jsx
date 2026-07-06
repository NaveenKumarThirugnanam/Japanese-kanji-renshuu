import './Complete.css'

export default function Complete({ result, onRetryWrong, onRestart, onBack }) {
  const { correct, wrong, wrongCards, rangeFrom, rangeTo } = result
  const total = correct + wrong
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const icon = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '📚' : '💪'
  const title =
    pct >= 90 ? '素晴らしい！ Outstanding!' :
    pct >= 70 ? 'よくできました！ Well done!' :
    pct >= 50 ? 'もう少し！ Keep going!' :
    '練習が必要！ Keep practicing!'

  return (
    <div className="complete">
      <div className="big-icon">{icon}</div>
      <div className="comp-title">{title}</div>
      <div className="comp-range">KANJI #{rangeFrom}–{rangeTo}</div>

      <div className="comp-stats">
        <div className="cstat">
          <span className="big" style={{ color: 'var(--green)' }}>{correct}</span>
          <span className="sm">CORRECT</span>
        </div>
        <div className="cstat">
          <span className="big" style={{ color: 'var(--red)' }}>{wrong}</span>
          <span className="sm">WRONG</span>
        </div>
        <div className="cstat">
          <span className="big">{pct}%</span>
          <span className="sm">SCORE</span>
        </div>
      </div>

      {wrongCards.length > 0 && (
        <div className="wrong-list">
          <div className="wl-title">REVIEW ({wrongCards.length})</div>
          {wrongCards.map((c, i) => (
            <div key={i} className="wl-item">
              <span>{c.word}</span>
              <span className="wl-read">{c.reading}</span>
            </div>
          ))}
        </div>
      )}

      <div className="btn-group">
        {wrongCards.length > 0 && (
          <button className="actbtn" onClick={onRetryWrong}>↺ Retry wrong cards</button>
        )}
        <button className="actbtn" onClick={onRestart}>↺ Restart this range</button>
        <button className="actbtn sec" onClick={onBack}>← Back to range select</button>
      </div>
    </div>
  )
}
