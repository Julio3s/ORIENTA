import { useState } from 'react'
import AnimationIntro from '../components/AnimationIntro'
import FormulaireNotes from '../components/etudiant/FormulaireNotes'
import ResultatCarte from '../components/etudiant/ResultatCarte'
import ModalDetailFiliere from '../components/etudiant/ModalDetailFiliere'

const FILTRES = [
  { key: 'tous',           label: 'Tous',          icon: '◉' },
  { key: 'bourse',         label: 'Bourse',         icon: '🏆' },
  { key: 'demi_bourse',    label: 'Demi-bourse',    icon: '🎓' },
  { key: 'payant',         label: 'Payant',          icon: '💳' },
  { key: 'non_admissible', label: 'Non admissible', icon: '✗' },
]

export default function EspaceEtudiant() {
  const [animDone, setAnimDone] = useState(false)
  const [resultats, setResultats] = useState(null)
  const [serie, setSerie]         = useState(null)
  const [filtre, setFiltre]       = useState('tous')
  const [selected, setSelected]   = useState(null)

  const handleResultats = (data, serieObj) => {
    setResultats(data); setSerie(serieObj); setFiltre('tous')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtres = resultats?.filter(r => filtre === 'tous' || r.meilleur_statut === filtre) ?? []

  if (!animDone) return <AnimationIntro onDone={() => setAnimDone(true)} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' }}>O</div>
            <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              <span style={{ color: 'var(--blue-brand)' }}>ORIENTA</span>
              <span style={{ color: 'var(--accent)' }}>+</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resultats && (
              <button onClick={() => { setResultats(null); setSerie(null) }}
                className="btn-ghost text-xs px-3 py-1.5">
                ← Retour
              </button>
            )}
            <a href="/admin-login"
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--muted)', background: '#F1F5F9' }}>
              Admin
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">

        {/* ── Hero ── */}
        {!resultats && (
          <div className="text-center pt-12 pb-8 anim-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'var(--blue-pale)', color: 'var(--blue-brand)', border: '1px solid #BFDBFE' }}>
              <span style={{ color: 'var(--accent)' }}>★</span>
              Plateforme d'orientation · Bénin 2024
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', fontFamily: 'DM Sans' }}>
              Trouve la filière<br />
              <span className="text-brand">qui te correspond</span>
            </h1>

            <p className="mt-4 mb-8 text-base max-w-lg mx-auto" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
              Renseigne tes notes du Bac et découvre instantanément les universités et filières qui correspondent à ton profil — avec tes chances d'obtenir une bourse.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-10">
              {[['10+', 'Filières disponibles'], ['6+', 'Universités'], ['100%', 'Gratuit']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-mid)', fontFamily: 'DM Sans' }}>{v}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Formulaire ── */}
        {!resultats && (
          <div className="anim-fade-up delay-150">
            <FormulaireNotes onResultats={handleResultats} />
          </div>
        )}

        {/* ── Résultats ── */}
        {resultats && (
          <div className="pt-6 anim-fade-in">
            {/* Header */}
            <div className="mb-6">
              <div className="section-label mb-2">Résultats personnalisés</div>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'DM Sans' }}>
                    {resultats.length} filière{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}
                  </h2>
                  {serie && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>
                      Série <strong style={{ color: 'var(--blue-mid)' }}>{serie.code} — {serie.nom}</strong>
                    </p>
                  )}
                </div>
                <button onClick={() => { setResultats(null); setSerie(null) }} className="btn-ghost text-sm">
                  🔄 Nouvelle recherche
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 flex-wrap mb-6">
              {FILTRES.map(f => {
                const count = f.key === 'tous' ? resultats.length : resultats.filter(r => r.meilleur_statut === f.key).length
                const active = filtre === f.key
                return (
                  <button key={f.key} onClick={() => setFiltre(f.key)}
                    className="text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    style={active ? {
                      background: 'var(--blue-mid)', color: 'white',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                    } : {
                      background: 'white', color: 'var(--muted)',
                      border: '1.5px solid var(--border)'
                    }}>
                    <span style={{ fontSize: '0.8em' }}>{f.icon}</span>
                    {f.label}
                    {count > 0 && <span style={{ opacity: 0.65, fontSize: '0.8em' }}>({count})</span>}
                  </button>
                )
              })}
            </div>

            {/* Grille */}
            {filtres.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                <p className="font-medium">Aucune filière dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtres.map((r, idx) => (
                  <div key={r.filiere_id} className="anim-fade-up" style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}>
                    <ResultatCarte filiere={r} rank={resultats.indexOf(r) + 1} onClick={setSelected} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      {!resultats && (
        <footer className="text-center py-6" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.75rem' }}>
          ORIENTA+ · Orientation universitaire au Bénin · 2024
        </footer>
      )}

      {selected && <ModalDetailFiliere filiere={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}