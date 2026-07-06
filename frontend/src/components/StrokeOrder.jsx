import { useEffect, useRef, useState } from 'react'
import { fetchStrokeOrder } from '../api/kanji'
import './StrokeOrder.css'

export default function StrokeOrder({ character }) {
  const containerRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | animating | unavailable
  const [svg, setSvg] = useState(null)

  useEffect(() => {
    setSvg(null)
    setStatus('loading')
    fetchStrokeOrder(character)
      .then(data => {
        if (data.svg) { setSvg(data.svg); setStatus('ready') }
        else setStatus('unavailable')
      })
      .catch(() => setStatus('unavailable'))
  }, [character])

  useEffect(() => {
    if (!svg || !containerRef.current) return
    const el = containerRef.current
    el.innerHTML = svg
    const svgEl = el.querySelector('svg')
    if (!svgEl) return
    svgEl.setAttribute('width', '140')
    svgEl.setAttribute('height', '140')
    svgEl.style.display = 'block'
  }, [svg])

  function animate() {
    if (!containerRef.current || status === 'animating') return
    setStatus('animating')

    // KanjiVG stroke paths have IDs ending in -s1, -s2, etc.
    const paths = Array.from(
      containerRef.current.querySelectorAll('[id*="-s"]')
    ).filter(el => el.tagName === 'path')

    paths.forEach((path, i) => {
      const len = path.getTotalLength()
      path.style.transition = 'none'
      path.style.strokeDasharray = len
      path.style.strokeDashoffset = len

      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 0.45s ease'
        path.style.strokeDashoffset = '0'
      }, i * 450)
    })

    setTimeout(() => setStatus('ready'), paths.length * 450 + 500)
  }

  if (status === 'loading') return <div className="so-loading">筆順…</div>
  if (status === 'unavailable') return null

  return (
    <div className="so-wrap">
      <div className="so-label">筆順 STROKE ORDER</div>
      <div ref={containerRef} className="so-svg" />
      <button
        className="so-btn"
        onClick={animate}
        disabled={status === 'animating'}
      >
        {status === 'animating' ? '▶ playing…' : '▶ Animate'}
      </button>
    </div>
  )
}
