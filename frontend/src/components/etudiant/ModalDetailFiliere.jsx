import { useEffect } from 'react'
import BarreCompatibilite from './BarreCompatibilite'

const STATUT_C = {
  bourse:         { color: '#10B981', label: '🏆 Bourse complète' },
  demi_bourse:    { color: '#3B82F6', label: '🎓 Demi-bourse' },
  payant:         { color: '#F59E0B', label: '💳 Payant' },
  non_admissible: { color: '#EF4444', label: '✗ Non admissible' },
}

export default function ModalDetailFiliere({ filiere, onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  if (!filiere) return null
  const { filiere_nom, filiere_code, duree, description, debouches, moyenne_calculee, matieres_utilisees, universites, meilleur_statut, meilleur_pourcentage } = filiere
  const sc = STATUT_C[meilleur_statut] || STATUT_C.non_admissible

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(15,32,68,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full sm:max-w-2xl flex flex-col anim-scale-up"
        style={{
          background: 'white',
          borderRadius: '20px 20px 0 0',
          maxHeight: '92vh',
          boxShadow: '0 -8px 40px rgba(15,32,68,0.25)',
          // Desktop: centré et arrondi partout
        }}
        // override border-radius on desktop
      >
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-8 h-1 rounded-full" style={{ background: '#E2E8F0' }} />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                style={{ background: '#F1F5F9', color: '#64748B' }}>{filiere_code}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>⏱ {duree} an{duree>1?'s':''}</span>
              <span className="text-xs font-semibold" style={{ color: sc.color }}>{meilleur_pourcentage.toFixed(0)}% compat.</span>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--ink)', fontFamily: 'DM Sans', letterSpacing: '-0.02em' }}>
              {filiere_nom}
            </h2>
            {matieres_utilisees.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                Moy. <strong style={{ color: 'var(--ink)' }}>{moyenne_calculee}/20</strong>
                {' '}— {matieres_utilisees.map(m => `${m.matiere_nom}: ${m.note}`).join(' | ')}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
            style={{ background: '#F1F5F9', color: '#64748B' }}>✕</button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {description && (
            <div>
              <div className="section-label mb-2">À propos</div>
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 }}>{description}</p>
            </div>
          )}

          {debouches && (
            <div>
              <div className="section-label mb-2">💼 Débouchés professionnels</div>
              <div className="flex flex-wrap gap-2">
                {debouches.split(',').map((d, i) => (
                  <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                    {d.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="section-label mb-3">🏛 Universités proposant cette filière ({universites.length})</div>
            <div className="space-y-3">
              {universites.map((u, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ border: '1.5px solid var(--border)', background: '#FAFAFA' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{u.universite_nom}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={u.est_publique
                            ? { background: '#D1FAE5', color: '#065F46' }
                            : { background: '#F3E8FF', color: '#6B21A8' }}>
                          {u.est_publique ? 'Public' : 'Privé'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                        📍 {u.universite_ville} · {u.annee} · {u.places_disponibles} places
                      </p>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sc.color, flexShrink: 0, fontFamily: 'DM Sans' }}>
                      {u.pourcentage}%
                    </div>
                  </div>
                  <BarreCompatibilite pourcentage={u.pourcentage} statut={u.statut} showLabel={false} />
                  <div className="flex flex-wrap gap-4 mt-2.5 text-xs">
                    <span style={{ color: '#D97706' }}>Min: <strong>{u.seuil_minimum}/20</strong></span>
                    <span style={{ color: '#2563EB' }}>½ Bourse: <strong>{u.seuil_demi_bourse}/20</strong></span>
                    <span style={{ color: '#059669' }}>Bourse: <strong>{u.seuil_bourse}/20</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="btn-primary w-full">Fermer</button>
        </div>
      </div>
    </div>
  )
}