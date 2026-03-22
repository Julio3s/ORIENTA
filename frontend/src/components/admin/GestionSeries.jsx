import { useState, useEffect, useCallback } from 'react'
import {
  getSeries, getSerie, createSerie, updateSerie, deleteSerie,
  getMatieres, createSerieMatiere, updateSerieMatiere, deleteSerieMatiere
} from '../../api/client'

// ── Modal d'édition d'une série ──────────────────────────────────────────────
function ModalSerie({ serieInit, matieres, onClose, onSaved }) {
  const [smList, setSmList] = useState(serieInit?.serie_matieres || [])
  const [form, setForm] = useState({
    code: serieInit?.code || '',
    nom: serieInit?.nom || '',
    description: serieInit?.description || '',
  })
  const [addForm, setAddForm] = useState({ matiere_id: '', coefficient: 1 })
  const [editingSmId, setEditingSmId] = useState(null)
  const [editCoef, setEditCoef] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  // Sauvegarder infos de la série
  const handleSaveSerie = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (serieInit) {
        await updateSerie(serieInit.id, form)
        onSaved()
      } else {
        await createSerie(form)
        onSaved()
        onClose()
      }
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur')
    } finally { setSaving(false) }
  }

  // Ajouter une matière — mise à jour locale IMMÉDIATE
  const handleAddMatiere = async (e) => {
    e.preventDefault()
    setError('')
    if (!addForm.matiere_id) return
    const matiere = matieres.find(m => m.id === parseInt(addForm.matiere_id))
    const coef = parseInt(addForm.coefficient)
    try {
      const res = await createSerieMatiere({
        serie_id: serieInit.id,
        matiere_id: parseInt(addForm.matiere_id),
        coefficient: coef,
      })
      // Mise à jour IMMÉDIATE de la liste locale
      setSmList(prev => {
        const exists = prev.find(sm => sm.matiere?.id === parseInt(addForm.matiere_id))
        if (exists) {
          return prev.map(sm =>
            sm.matiere?.id === parseInt(addForm.matiere_id)
              ? { ...sm, coefficient: coef }
              : sm
          )
        }
        return [...prev, { id: res.data.id, matiere, coefficient: coef }]
      })
      setAddForm({ matiere_id: '', coefficient: 1 })
      onSaved() // met à jour la liste en arrière-plan
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur ajout')
    }
  }

  // Modifier le coefficient — mise à jour locale IMMÉDIATE
  const handleSaveCoef = async (sm) => {
    setError('')
    const newCoef = parseInt(editCoef)
    try {
      await updateSerieMatiere(sm.id, {
        serie_id: serieInit.id,
        matiere_id: sm.matiere?.id,
        coefficient: newCoef,
      })
      // Mise à jour IMMÉDIATE
      setSmList(prev => prev.map(x =>
        x.id === sm.id ? { ...x, coefficient: newCoef } : x
      ))
      setEditingSmId(null)
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur modification')
    }
  }

  // Supprimer une matière — mise à jour locale IMMÉDIATE
  const handleDeleteSM = async (sm) => {
    if (!confirm(`Supprimer "${sm.matiere?.nom}" de cette série ?`)) return
    setError('')
    try {
      await deleteSerieMatiere(sm.id)
      // Mise à jour IMMÉDIATE
      setSmList(prev => prev.filter(x => x.id !== sm.id))
      onSaved()
    } catch {
      setError('Impossible de supprimer')
    }
  }

  const matieresDejaPresentes = smList.map(sm => sm.matiere?.id)
  const matieresDisponibles = matieres.filter(m => !matieresDejaPresentes.includes(m.id))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-display font-bold text-gray-800">
            {serieInit ? `✏️ Série ${serieInit.code} — ${serieInit.nom}` : '➕ Nouvelle série'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* ── Section 1 : Infos ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Informations générales
            </h3>
            <form onSubmit={handleSaveSerie} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Code *</label>
                  <input
                    className="input-field text-sm"
                    placeholder="ex: C"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input
                    className="input-field text-sm"
                    placeholder="Mathématiques..."
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea
                  className="input-field text-sm"
                  rows="2"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary text-sm w-full">
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les infos'}
              </button>
            </form>
          </div>

          {/* ── Section 2 : Matières ── */}
          {serieInit && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                Matières de la série
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {smList.length}
                </span>
              </h3>

              {/* Liste matières */}
              <div className="space-y-2 mb-4">
                {smList.length === 0 && (
                  <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Aucune matière — utilisez le formulaire ci-dessous pour en ajouter
                  </div>
                )}
                {smList.map(sm => (
                  <div
                    key={sm.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                  >
                    <div className="flex-1 text-sm font-medium text-gray-700">
                      {sm.matiere?.nom || '—'}
                    </div>

                    {editingSmId === sm.id ? (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Coef.</label>
                        <input
                          type="number" min="1" max="10"
                          value={editCoef}
                          onChange={e => setEditCoef(e.target.value)}
                          className="w-16 input-field text-sm text-center py-1"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCoef(sm) }}
                        />
                        <button
                          onClick={() => handleSaveCoef(sm)}
                          className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg hover:bg-emerald-600 font-medium"
                        >✓ OK</button>
                        <button
                          onClick={() => setEditingSmId(null)}
                          className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-300"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                          ×{sm.coefficient}
                        </span>
                        <button
                          onClick={() => { setEditingSmId(sm.id); setEditCoef(sm.coefficient) }}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100"
                        >✏️ Coef</button>
                        <button
                          onClick={() => handleDeleteSM(sm)}
                          className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100"
                        >🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulaire ajout */}
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 mb-2">➕ Ajouter une matière</p>
                <form onSubmit={handleAddMatiere} className="flex gap-2">
                  <select
                    className="input-field text-sm flex-1"
                    value={addForm.matiere_id}
                    onChange={e => setAddForm(f => ({ ...f, matiere_id: e.target.value }))}
                    required
                  >
                    <option value="">-- Choisir une matière --</option>
                    {matieresDisponibles.map(m => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                  <input
                    type="number" min="1" max="10"
                    placeholder="Coef"
                    className="input-field text-sm w-20 text-center"
                    value={addForm.coefficient}
                    onChange={e => setAddForm(f => ({ ...f, coefficient: e.target.value }))}
                  />
                  <button type="submit" className="btn-primary text-sm px-4 whitespace-nowrap">
                    + Ajouter
                  </button>
                </form>
                {matieresDisponibles.length === 0 && (
                  <p className="text-xs text-emerald-600 mt-1.5">
                    ✅ Toutes les matières disponibles ont été ajoutées
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-1">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function GestionSeries() {
  const [series, setSeries] = useState([])
  const [matieres, setMatieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalSerie, setModalSerie] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [s, m] = await Promise.all([getSeries(), getMatieres()])
      setSeries(s.data)
      setMatieres(m.data)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette série ?')) return
    try { await deleteSerie(id); load() }
    catch { setError('Impossible de supprimer') }
  }

  if (loading) return <div className="py-12 text-center text-gray-400 animate-pulse">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">
          Séries de Bac
          <span className="ml-2 text-sm font-normal text-gray-400">({series.length})</span>
        </h2>
        <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
          + Nouvelle série
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">⚠️ {error}</div>
      )}

      <div className="space-y-2">
        {series.map(s => {
          const nbMatieres = s.serie_matieres?.length || 0
          return (
            <div key={s.id} className="card border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-700">Série {s.code}</span>
                    <span className="text-gray-700 text-sm">{s.nom}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {nbMatieres} matière{nbMatieres > 1 ? 's' : ''}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.description}</p>}
                  {nbMatieres > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.serie_matieres.slice(0, 5).map(sm => (
                        <span key={sm.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          {sm.matiere?.nom} <span className="opacity-60">×{sm.coefficient}</span>
                        </span>
                      ))}
                      {nbMatieres > 5 && <span className="text-xs text-gray-400">+{nbMatieres - 5} autres</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalSerie(s)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                  >✏️ Modifier</button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs bg-red-50 text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-100"
                  >🗑️</button>
                </div>
              </div>
            </div>
          )
        })}

        {series.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p>Aucune série créée</p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm mt-3">
              Créer la première série
            </button>
          </div>
        )}
      </div>

      {/* Le key={modalSerie.id} force React à recréer le modal à chaque ouverture */}
      {modalSerie && (
        <ModalSerie
          key={modalSerie.id}
          serieInit={modalSerie}
          matieres={matieres}
          onClose={() => { setModalSerie(null); load() }}
          onSaved={load}
        />
      )}

      {showNewModal && (
        <ModalSerie
          serieInit={null}
          matieres={matieres}
          onClose={() => { setShowNewModal(false); load() }}
          onSaved={load}
        />
      )}
    </div>
  )
}
