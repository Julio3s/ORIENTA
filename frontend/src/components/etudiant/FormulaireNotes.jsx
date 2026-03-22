import { useState, useEffect } from 'react'
import { getSeries, getSuggestions } from '../../api/client'

export default function FormulaireNotes({ onResultats }) {
  const [series, setSeries]         = useState([])
  const [serieId, setSerieId]       = useState('')
  const [matieres, setMatieres]     = useState([])
  const [notes, setNotes]           = useState({})
  const [loading, setLoading]       = useState(false)
  const [loadingSeries, setLS]      = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    getSeries().then(r => setSeries(r.data)).catch(() => setError('Impossible de charger les séries')).finally(() => setLS(false))
  }, [])

  const onSerie = id => {
    setSerieId(id); setNotes({})
    setMatieres(series.find(s => s.id === parseInt(id))?.serie_matieres || [])
  }

  const onNote = (id, val) => {
    const n = parseFloat(val)
    if (val === '' || (n >= 0 && n <= 20)) setNotes(p => ({ ...p, [id]: val === '' ? '' : n }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (!serieId) return setError('Sélectionnez une série')
    const valid = Object.entries(notes).filter(([, v]) => v !== '' && v !== undefined)
    if (!valid.length) return setError('Entrez au moins une note')
    setLoading(true); setError('')
    try {
      const payload = {}; valid.forEach(([k,v]) => { payload[k] = parseFloat(v) })
      const { data } = await getSuggestions(parseInt(serieId), payload)
      onResultats(data.resultats, series.find(s => s.id === parseInt(serieId)))
    } catch (err) { setError(err.response?.data?.error || 'Erreur lors du calcul') }
    finally { setLoading(false) }
  }

  const serie = series.find(s => s.id === parseInt(serieId))
  const filled = Object.values(notes).filter(v => v !== '').length

  const noteColor = n => {
    if (n >= 16) return { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' }
    if (n >= 12) return { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' }
    if (n >= 10) return { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' }
    return { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(37,99,235,0.08)' }}>

        {/* En-tête */}
        <div className="flex items-center gap-3 pb-5 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, var(--blue-brand), var(--blue-light))' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', fontFamily: 'DM Sans' }}>
              Mes notes du Bac
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1px' }}>
              Renseigne tes notes pour obtenir des suggestions personnalisées
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          {/* Série */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>
              Série de Bac
            </label>
            {loadingSeries ? (
              <div className="skeleton h-11 w-full" />
            ) : (
              <select value={serieId} onChange={e => onSerie(e.target.value)} className="input-field font-medium">
                <option value="">— Sélectionne ta série —</option>
                {series.map(s => <option key={s.id} value={s.id}>Série {s.code} — {s.nom}</option>)}
              </select>
            )}
            {serie?.description && (
              <p className="text-xs mt-1.5 ml-0.5" style={{ color: 'var(--blue-mid)' }}>
                {serie.description}
              </p>
            )}
          </div>

          {/* Notes */}
          {matieres.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(sur 20)</span>
                </label>
                {filled > 0 && (
                  <span className="badge badge-blue">{filled}/{matieres.length} saisies</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matieres.map(sm => {
                  const val = notes[sm.matiere.id] ?? ''
                  const num = parseFloat(val)
                  const has = val !== '' && !isNaN(num)
                  const c   = has ? noteColor(num) : null
                  return (
                    <div key={sm.matiere.id}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-150"
                      style={{
                        background: has ? c.bg : '#FAFAFA',
                        border: `1.5px solid ${has ? c.border : 'var(--border)'}`,
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>
                          {sm.matiere.nom}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)', marginTop: '1px' }}>
                          Coef. {sm.coefficient}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number" min="0" max="20" step="0.25"
                          placeholder="—"
                          value={val}
                          onChange={e => onNote(sm.matiere.id, e.target.value)}
                          style={{
                            width: '48px', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
                            background: 'transparent', border: 'none', outline: 'none',
                            color: has ? c.text : '#94A3B8', fontFamily: 'DM Sans'
                          }}
                        />
                        {has && <span style={{ fontSize: '0.65rem', color: c.text, fontWeight: 600 }}>/20</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--muted)' }}>
                Laisse vide les matières dont tu n'as pas encore la note
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading || !serieId} className="btn-primary w-full py-3"
            style={{ fontSize: '0.9375rem' }}>
            {loading
              ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙</span> Calcul en cours...</>
              : <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: 4}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Découvrir mes filières</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}