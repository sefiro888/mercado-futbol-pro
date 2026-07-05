import { useState } from 'react'
import { sharePlayerCard } from '@/lib/shareCard.js'
import { playerPhotoUrl } from '@/lib/photos.js'
import { clubLogoUrl } from '@/lib/logos.js'
import { getClubById } from '@/lib/data.js'
import './ShareCardButton.css'

export default function ShareCardButton({ player, size = 'md' }) {
  const [state, setState] = useState('idle') // idle | loading | done | error

  const club = player?.currentClubId ? getClubById(player.currentClubId) :
               player?.clubId        ? getClubById(player.clubId) : null

  async function handleClick() {
    if (state === 'loading') return
    setState('loading')
    try {
      const result = await sharePlayerCard({
        player,
        club,
        photoUrl: player ? playerPhotoUrl(player) : null,
        logoUrl:  club   ? clubLogoUrl(club.id)   : null,
      })
      setState(result.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
    setTimeout(() => setState('idle'), 2500)
  }

  return (
    <button
      className={`share-card-btn share-card-btn--${size} share-card-btn--${state}`}
      onClick={handleClick}
      title="Compartir cromo del jugador"
      aria-label="Compartir cromo del jugador como imagen"
    >
      {state === 'loading' ? (
        <svg className="scb-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : state === 'done' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : state === 'error' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      )}
      <span className="scb-label">
        {state === 'loading' ? 'Generando…'
         : state === 'done'  ? 'Compartido'
         : state === 'error' ? 'Error'
         : 'Compartir cromo'}
      </span>
    </button>
  )
}
