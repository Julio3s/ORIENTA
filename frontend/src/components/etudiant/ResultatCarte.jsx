import BarreCompatibilite from './BarreCompatibilite'

const S = {
  bourse:         { label: '🏆 Bourse',         color: '#10B981', bg: '#D1FAE5', border: '#6EE7B7' },
  demi_bourse:    { label: '🎓 Demi-bourse',    color: '#3B82F6', bg: '#DBEAFE', border: '#93C5FD' },
  payant:         { label: '💳 Payant',          color: '#F59E0B', bg: '#FEF3C7', border: '#FCD34D' },
  non_admissible: { label: '✗ Non admissible',  color: '#EF4444', bg: '#FEE2E2', border: '#FCA5A5' },
}

const RANKS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function ResultatCarte({ filiere, rank, onClick }) {
  const { filiere_nom, filiere_code, duree, meilleur_pourcentage, meilleur_statut, moyenne_calculee, universites, matieres_utilisees } = filiere
  const s = S[meilleur_statut] || S.non_admissible

  return (
    <div className="card-interactive group" style={{ borderLeft: `3px solid ${s.color}` }}
      onClick={() => onClick(filiere)}>

      <div className="flex items-start gap-3">
        {/* Rang */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: '#F8FAFC', border: '1px solid var(--border)' }}>
          {RANKS[rank] || <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>#{rank}</span>}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate group-hover:text-blue-700 transition-colors"
                style={{ fontFamily: 'DM Sans', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                {filiere_nom}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: '#F1F5F9', color: '#64748B', fontSize: '0.7rem' }}>{filiere_code}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{duree} an{duree>1?'s':''}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  moy. <strong style={{ color: 'var(--ink)' }}>{moyenne_calculee}/20</strong>
                </span>
              </div>
            </div>
            {/* % */}
            <div className="flex-shrink-0 text-right">
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: 'DM Sans' }}>
                {meilleur_pourcentage.toFixed(0)}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>%</span>
              </div>
            </div>
          </div>

          {/* Badge statut */}
          <div className="mt-2 mb-2.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {s.label}
            </span>
          </div>

          <BarreCompatibilite pourcentage={meilleur_pourcentage} statut={meilleur_statut} showLabel={false} />

          {/* Matières */}
          {matieres_utilisees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {matieres_utilisees.map((m, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                  {m.matiere_nom}: {m.note}/20
                </span>
              ))}
            </div>
          )}

          {/* Universités */}
          {universites.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {universites.slice(0, 3).map((u, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'white', color: '#64748B', border: '1px solid var(--border)' }}>
                  🏛 {u.universite_nom.replace(/\(.*?\)/g,'').trim().substring(0, 20)}{u.universite_nom.length > 20 ? '…' : ''}
                </span>
              ))}
              {universites.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#F8FAFC', color: '#94A3B8', border: '1px solid var(--border)' }}>
                  +{universites.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold group-hover:underline" style={{ color: 'var(--blue-mid)' }}>
          Voir les détails →
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {universites.length} université{universites.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}