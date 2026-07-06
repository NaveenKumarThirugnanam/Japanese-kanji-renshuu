import './Header.css'

export default function Header({ tab, onTab }) {
  return (
    <header className="header">
      <div className="htop">
        <div className="htag">日本語能力試験 N2</div>
        <h1>漢字 <span>Anki</span></h1>
        <div className="hsub">SHIN KANZEN MASTER • 1046 KANJI</div>
      </div>
      <div className="htabs">
        <button
          className={`htab${tab === 'dict' ? ' on' : ''}`}
          onClick={() => onTab('dict')}
        >
          <span className="htab-jp">辞典</span>
          <span className="htab-en">Dictionary</span>
        </button>
        <button
          className={`htab${tab === 'study' ? ' on' : ''}`}
          onClick={() => onTab('study')}
        >
          <span className="htab-jp">練習</span>
          <span className="htab-en">Study</span>
        </button>
      </div>
    </header>
  )
}
