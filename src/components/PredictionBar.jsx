import { useState, useEffect } from 'react'
import { getPrediction, setPrediction } from '@/lib/predictions.js'
import './PredictionBar.css'

export default function PredictionBar({ rumourId, rumourStatus }) {
  const [pred, setPred] = useState(() => getPrediction(rumourId))

  useEffect(() => {
    function onPrediction(e) {
      if (e.detail.rumourId === rumourId) setPred(getPrediction(rumourId))
    }
    window.addEventListener('mfp-prediction', onPrediction)
    return () => window.removeEventListener('mfp-prediction', onPrediction)
  }, [rumourId])

  function vote(v) {
    setPred(setPrediction(rumourId, v))
  }

  const isConfirmed   = rumourStatus === 'confirmado'
  const isDiscarded   = rumourStatus === 'descartado'
  const isResolved    = isConfirmed || isDiscarded
  const userVote      = pred?.vote ?? null

  let outcome = null
  if (pred && isResolved) {
    const correct =
      (isConfirmed && userVote === 'si') ||
      (isDiscarded && userVote === 'no')
    outcome = correct ? 'correct' : 'wrong'
  }

  return (
    <div className="pred-bar">
      <span className="pred-label">¿Pasará?</span>
      <div className="pred-btns">
        <button
          className={`pred-btn pred-btn--si ${userVote === 'si' ? 'pred-btn--active' : ''} ${outcome === 'correct' && userVote === 'si' ? 'pred-btn--win' : ''} ${outcome === 'wrong' && userVote === 'si' ? 'pred-btn--lose' : ''}`}
          onClick={() => !isResolved && vote('si')}
          disabled={isResolved}
          title="Creo que pasará"
        >
          ✓ Sí
        </button>
        <button
          className={`pred-btn pred-btn--no ${userVote === 'no' ? 'pred-btn--active' : ''} ${outcome === 'correct' && userVote === 'no' ? 'pred-btn--win' : ''} ${outcome === 'wrong' && userVote === 'no' ? 'pred-btn--lose' : ''}`}
          onClick={() => !isResolved && vote('no')}
          disabled={isResolved}
          title="Creo que no pasará"
        >
          ✗ No
        </button>
      </div>
      {outcome === 'correct' && <span className="pred-result pred-result--win">✅ Acertaste</span>}
      {outcome === 'wrong'   && <span className="pred-result pred-result--lose">❌ Fallaste</span>}
    </div>
  )
}
