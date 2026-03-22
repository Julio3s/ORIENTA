import { useState, useEffect } from 'react'
import {
  getFilieres, getFiliere, createFiliere, updateFiliere, deleteFiliere,
  getMatieres, getSeries, createFiliereMatiere, updateFiliereMatiere, deleteFiliereMatiere
} from '../../api/client'

const emptyForm = { nom: '', code: '', duree: 3, description: '', debouches: '', series_ids: [] }

// ── Modal filière ─────────────────────────────────────────────────────────────
function ModalFiliere({ filiereInit, matieres, series, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: filiereInit?.nom || '',
    code: filiereInit?.code || '',
    duree: filiereInit?.duree || 3,
    description: filiereInit?.description || '',
    debouches: filiereInit?.debouches || '',
    series_ids: filiereInit?.series_acceptees?.map(s => s.id) || [],
  })
  // État local des matières prioritaires — mis à jour immédiatement sans API
  const [fmList, setFmList] = useState(
    [...(filiereInit?.filiere_matieres || [])].sort((a, b) => a.ordre - b.ordre)
  )
  const [addFmForm, setAddFmForm] = useState({ matiere_id: '', ordre: '' })
  const [editingFmId, setEditingFmId] = useState(null)
  const [editFmForm, setEditFmForm] = useState({ matiere_id: '', ordre: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  const toggleSerie = (id) => {
    setForm(f => ({
      ...f,
      series_ids: f.series_ids.includes(id)
        ? f.series_ids.filter(x => x !== id)
        : [...f.series_ids, id]
    }))
  }

  // Sauvegarder infos filière
  const handleSaveFiliere = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, series_ids: form.series_ids.map(Number) }
      if (filiereInit) {
        await updateFiliere(filiereInit.id, payload)
        onSaved()
      } else {
        await createFiliere(payload)
        onSaved()
        onClose()
      }
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur')
    } finally { setSaving(false) }
  }

  // Ajouter une matière prioritaire — mise à jour locale immédiate
  const handleAddFm = async (e) => {
    e.preventDefault()
    setError('')
    if (!addFmForm.matiere_id || !addFmForm.ordre) return
    const matiere = matieres.find(m => m.id === parseInt(addFmForm.matiere_id))
    const ordre = parseInt(addFmForm.ordre)
    try {
      const res = await createFiliereMatiere({
        filiere_id: filiereInit.id,
        matiere_id: parseInt(addFmForm.matiere_id),
        ordre,
      })
      // Mise à jour immédiate — remplace si l'ordre existe déjà
      setFmList(prev => {
        const filtered = prev.filter(fm => fm.ordre !== ordre)
        return [...filtered, { id: res.data.id, matiere, ordre }].sort((a, b) => a.ordre - b.ordre)
      })
      setAddFmForm({ matiere_id: '', ordre: '' })
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur ajout')
    }
  }

  // Modifier une matière prioritaire — mise à jour locale immédiate
  const handleSaveFm = async (fm) => {
    setError('')
    const matiere = matieres.find(m => m.id === parseInt(editFmForm.matiere_id))
    const ordre = parseInt(editFmForm.ordre)
    try {
      await updateFiliereMatiere(fm.id, {
        filiere_id: filiereInit.id,
        matiere_id: parseInt(editFmForm.matiere_id),
        ordre,
      })
      // Mise à jour immédiate
      setFmList(prev => {
        // Retirer l'ancien ordre si conflit
        const filtered = prev.filter(x => x.id !== fm.id && x.ordre !== ordre)
        return [...filtered, { id: fm.id, matiere, ordre }].sort((a, b) => a.ordre - b.ordre)
      })
      setEditingFmId(null)
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur modification')
    }
  }

  // Supprimer une matière prioritaire — mise à jour locale immédiate
  const handleDeleteFm = async (fm) => {
    if (!confirm(`Supprimer "${fm.matiere?.nom}" des matières prioritaires ?`)) return
    setError('')
    try {
      await deleteFiliereMatiere(fm.id)
      setFmList(prev => prev.filter(x => x.id !== fm.id))
      onSaved()
    } catch { setError('Impossible de supprimer') }
  }

  // Ordres disponibles pour l'ajout (ceux pas encore pris, ou tous si on remplace)
  const ordresUtilises = fmList.map(fm => fm.ordre)
  const matieresUtilisees = fmList.map(fm => fm.matiere?.id)
  const matieresDisponibles = matieres.filter(m => !matieresUtilisees.includes(m.id))

  const labelOrdre = (o) => o === 1 ? '🥇 Priorité 1' : o === 2 ? '🥈 Priorité 2' : '🥉 Priorité 3'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-display font-bold text-gray-800">
            {filiereInit ? `✏️ ${filiereInit.nom}` : '➕ Nouvelle filière'}
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

          {/* ── Section 1 : Infos filière ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Informations générales
            </h3>
            <form onSubmit={handleSaveFiliere} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input className="input-field text-sm" placeholder="Licence en Informatique"
                    value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Code *</label>
                  <input className="input-field text-sm" placeholder="INFO-L"
                    value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Durée (ans) *</label>
                  <input type="number" min="1" max="10" className="input-field text-sm"
                    value={form.duree} onChange={e => setForm(f => ({ ...f, duree: parseInt(e.target.value) }))} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <textarea className="input-field text-sm" rows="2"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Débouchés (séparés par virgule)</label>
                  <input className="input-field text-sm" placeholder="Développeur, Analyste..."
                    value={form.debouches} onChange={e => setForm(f => ({ ...f, debouches: e.target.value }))} />
                </div>
              </div>

              {/* Séries acceptées */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Séries acceptées</label>
                <div className="flex flex-wrap gap-2">
                  {series.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleSerie(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        form.series_ids.includes(s.id)
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                      }`}>
                      Série {s.code}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary text-sm w-full">
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les infos'}
              </button>
            </form>
          </div>

          {/* ── Section 2 : Matières prioritaires (seulement si filière existante) ── */}
          {filiereInit && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                Matières prioritaires
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {fmList.length}/3
                </span>
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Ces 3 matières servent à calculer la moyenne pour les suggestions. L'ordre indique la priorité.
              </p>

              {/* Liste des matières prioritaires */}
              <div className="space-y-2 mb-4">
                {fmList.length === 0 && (
                  <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Aucune matière prioritaire — ajoutez-en ci-dessous
                  </div>
                )}

                {fmList.map(fm => (
                  <div key={fm.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    {editingFmId === fm.id ? (
                      /* Mode édition */
                      <div className="p-3 bg-blue-50 space-y-2">
                        <p className="text-xs font-semibold text-blue-700">Modifier cette matière prioritaire</p>
                        <div className="flex gap-2">
                          <select
                            className="input-field text-sm flex-1"
                            value={editFmForm.matiere_id}
                            onChange={e => setEditFmForm(f => ({ ...f, matiere_id: e.target.value }))}
                          >
                            <option value="">-- Matière --</option>
                            {matieres.map(m => (
                              <option key={m.id} value={m.id}>{m.nom}</option>
                            ))}
                          </select>
                          <select
                            className="input-field text-sm w-36"
                            value={editFmForm.ordre}
                            onChange={e => setEditFmForm(f => ({ ...f, ordre: e.target.value }))}
                          >
                            <option value="">-- Priorité --</option>
                            <option value="1">🥇 Priorité 1</option>
                            <option value="2">🥈 Priorité 2</option>
                            <option value="3">🥉 Priorité 3</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveFm(fm)}
                            className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 font-medium flex-1"
                          >✓ Enregistrer</button>
                          <button
                            onClick={() => setEditingFmId(null)}
                            className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-300"
                          >✕ Annuler</button>
                        </div>
                      </div>
                    ) : (
                      /* Mode affichage */
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50">
                        <div className="flex-shrink-0 text-lg">
                          {fm.ordre === 1 ? '🥇' : fm.ordre === 2 ? '🥈' : '🥉'}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">{fm.matiere?.nom}</span>
                          <span className="text-xs text-gray-400 ml-2">Priorité {fm.ordre}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingFmId(fm.id)
                              setEditFmForm({ matiere_id: fm.matiere?.id || '', ordre: fm.ordre })
                            }}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100"
                          >✏️ Modifier</button>
                          <button
                            onClick={() => handleDeleteFm(fm)}
                            className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100"
                          >🗑️</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulaire ajout */}
              {fmList.length < 3 && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 mb-2">
                    ➕ Ajouter une matière prioritaire ({3 - fmList.length} slot{3 - fmList.length > 1 ? 's' : ''} disponible{3 - fmList.length > 1 ? 's' : ''})
                  </p>
                  <form onSubmit={handleAddFm} className="flex gap-2">
                    <select
                      className="input-field text-sm flex-1"
                      value={addFmForm.matiere_id}
                      onChange={e => setAddFmForm(f => ({ ...f, matiere_id: e.target.value }))}
                      required
                    >
                      <option value="">-- Choisir une matière --</option>
                      {matieresDisponibles.map(m => (
                        <option key={m.id} value={m.id}>{m.nom}</option>
                      ))}
                    </select>
                    <select
                      className="input-field text-sm w-36"
                      value={addFmForm.ordre}
                      onChange={e => setAddFmForm(f => ({ ...f, ordre: e.target.value }))}
                      required
                    >
                      <option value="">-- Priorité --</option>
                      {[1, 2, 3].filter(o => !ordresUtilises.includes(o)).map(o => (
                        <option key={o} value={o}>{labelOrdre(o)}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary text-sm px-3 whitespace-nowrap">
                      + Ajouter
                    </button>
                  </form>
                  {matieresDisponibles.length === 0 && (
                    <p className="text-xs text-emerald-600 mt-1">Toutes les matières ont été utilisées</p>
                  )}
                </div>
              )}

              {fmList.length >= 3 && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    ✅ Les 3 matières prioritaires sont configurées.
                    Modifiez ou supprimez une entrée pour la remplacer.
                  </p>
                </div>
              )}
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
export default function GestionFilieres() {
  const [filieres, setFilieres] = useState([])
  const [matieres, setMatieres] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalFiliere, setModalFiliere] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [f, m, s] = await Promise.all([getFilieres(), getMatieres(), getSeries()])
      setFilieres(f.data)
      setMatieres(m.data)
      setSeries(s.data)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette filière ?')) return
    try { await deleteFiliere(id); load() }
    catch { setError('Impossible de supprimer') }
  }

  const filtered = filieres.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-400 animate-pulse">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">
          Filières
          <span className="ml-2 text-sm font-normal text-gray-400">({filieres.length})</span>
        </h2>
        <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
          + Nouvelle filière
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">⚠️ {error}</div>
      )}

      <input className="input-field text-sm" placeholder="🔍 Rechercher une filière..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className="space-y-2">
        {filtered.map(f => {
          const fmSorted = [...f.filiere_matieres].sort((a, b) => a.ordre - b.ordre)
          return (
            <div key={f.id} className="card border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{f.nom}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{f.code}</span>
                    <span className="text-xs text-gray-400">⏱ {f.duree} an{f.duree > 1 ? 's' : ''}</span>
                  </div>
                  {/* Séries */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.series_acceptees.map(s => (
                      <span key={s.id} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        Série {s.code}
                      </span>
                    ))}
                    {f.series_acceptees.length === 0 && (
                      <span className="text-xs text-orange-500">⚠️ Aucune série</span>
                    )}
                  </div>
                  {/* Matières prioritaires */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {fmSorted.map(fm => (
                      <span key={fm.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        {fm.ordre === 1 ? '🥇' : fm.ordre === 2 ? '🥈' : '🥉'} {fm.matiere?.nom}
                      </span>
                    ))}
                    {fmSorted.length === 0 && (
                      <span className="text-xs text-orange-500">⚠️ Aucune matière prioritaire</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalFiliere(f)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                  >✏️ Modifier</button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="text-xs bg-red-50 text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-100"
                  >🗑️</button>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🎓</div>
            <p>Aucune filière trouvée</p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm mt-3">
              Créer la première filière
            </button>
          </div>
        )}
      </div>

      {modalFiliere && (
        <ModalFiliere
          key={modalFiliere.id}
          filiereInit={modalFiliere}
          matieres={matieres}
          series={series}
          onClose={() => { setModalFiliere(null); load() }}
          onSaved={load}
        />
      )}

      {showNewModal && (
        <ModalFiliere
          filiereInit={null}
          matieres={matieres}
          series={series}
          onClose={() => { setShowNewModal(false); load() }}
          onSaved={load}
        />
      )}
    </div>
  )
}
