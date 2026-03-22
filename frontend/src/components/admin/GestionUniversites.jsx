import { useState, useEffect } from 'react'
import {
  getUniversites, createUniversite, updateUniversite, deleteUniversite,
  getFilieres, getSeuils, createSeuil, updateSeuil, deleteSeuil
} from '../../api/client'

const emptyForm = { nom: '', ville: '', description: '', est_publique: true, site_web: '' }
const emptySeuilForm = { filiere_id: '', annee: new Date().getFullYear(), seuil_minimum: '', seuil_demi_bourse: '', seuil_bourse: '', places_disponibles: 0 }

// ── Modal université ──────────────────────────────────────────────────────────
function ModalUniversite({ univInit, filieres, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: univInit?.nom || '',
    ville: univInit?.ville || '',
    description: univInit?.description || '',
    est_publique: univInit?.est_publique ?? true,
    site_web: univInit?.site_web || '',
  })
  // Liste locale des seuils de cette université
  const [seuils, setSeuils] = useState([])
  const [seuilForm, setSeuilForm] = useState(emptySeuilForm)
  const [editingSeuil, setEditingSeuil] = useState(null) // seuil en cours d'édition
  const [editSeuilForm, setEditSeuilForm] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingSeuils, setLoadingSeuils] = useState(false)

  // Charger les seuils de cette université au montage
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    if (univInit) chargerSeuils()
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [])

  const chargerSeuils = async () => {
    setLoadingSeuils(true)
    try {
      const res = await getSeuils()
      const mine = res.data.filter(s => s.universite?.id === univInit.id)
      setSeuils(mine)
    } catch { /* ignore */ }
    finally { setLoadingSeuils(false) }
  }

  // Sauvegarder infos université
  const handleSaveUniv = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (univInit) {
        await updateUniversite(univInit.id, form)
      } else {
        await createUniversite(form)
        onSaved()
        onClose()
        return
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur')
    } finally { setSaving(false) }
  }

  // Ajouter un seuil
  const handleAddSeuil = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        universite_id: univInit.id,
        filiere_id: parseInt(seuilForm.filiere_id),
        annee: parseInt(seuilForm.annee),
        seuil_minimum: parseFloat(seuilForm.seuil_minimum),
        seuil_demi_bourse: parseFloat(seuilForm.seuil_demi_bourse),
        seuil_bourse: parseFloat(seuilForm.seuil_bourse),
        places_disponibles: parseInt(seuilForm.places_disponibles),
      }
      const res = await createSeuil(payload)
      const filiere = filieres.find(f => f.id === parseInt(seuilForm.filiere_id))
      // Mise à jour locale immédiate
      setSeuils(prev => {
        const exists = prev.find(s => s.filiere_id === parseInt(seuilForm.filiere_id) && s.annee === parseInt(seuilForm.annee))
        const newEntry = {
          ...res.data,
          filiere_id: parseInt(seuilForm.filiere_id),
          filiere_nom: filiere?.nom || `Filière #${seuilForm.filiere_id}`,
          filiere_code: filiere?.code || '',
          universite: univInit,
        }
        if (exists) {
          return prev.map(s => s.id === exists.id ? newEntry : s)
        }
        return [...prev, newEntry]
      })
      setSeuilForm(emptySeuilForm)
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur ajout seuil')
    }
  }

  // Commencer l'édition d'un seuil
  const startEditSeuil = (s) => {
    setEditingSeuil(s.id)
    setEditSeuilForm({
      seuil_minimum: s.seuil_minimum,
      seuil_demi_bourse: s.seuil_demi_bourse,
      seuil_bourse: s.seuil_bourse,
      places_disponibles: s.places_disponibles,
      annee: s.annee,
    })
  }

  // Sauvegarder modification seuil
  const handleSaveSeuil = async (s) => {
    setError('')
    try {
      await updateSeuil(s.id, {
        universite_id: univInit.id,
        filiere_id: s.filiere_id,
        annee: parseInt(editSeuilForm.annee),
        seuil_minimum: parseFloat(editSeuilForm.seuil_minimum),
        seuil_demi_bourse: parseFloat(editSeuilForm.seuil_demi_bourse),
        seuil_bourse: parseFloat(editSeuilForm.seuil_bourse),
        places_disponibles: parseInt(editSeuilForm.places_disponibles),
      })
      // Mise à jour locale immédiate
      setSeuils(prev => prev.map(x => x.id === s.id
        ? { ...x, ...editSeuilForm,
            seuil_minimum: parseFloat(editSeuilForm.seuil_minimum),
            seuil_demi_bourse: parseFloat(editSeuilForm.seuil_demi_bourse),
            seuil_bourse: parseFloat(editSeuilForm.seuil_bourse),
            places_disponibles: parseInt(editSeuilForm.places_disponibles),
          }
        : x
      ))
      setEditingSeuil(null)
      onSaved()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur modification')
    }
  }

  // Supprimer un seuil
  const handleDeleteSeuil = async (s) => {
    if (!confirm(`Supprimer la filière "${s.filiere_nom || s.filiere_id}" de cette université ?`)) return
    setError('')
    try {
      await deleteSeuil(s.id)
      setSeuils(prev => prev.filter(x => x.id !== s.id))
      onSaved()
    } catch { setError('Impossible de supprimer') }
  }

  // Filières pas encore dans cette université
  const filieresDejaPresentes = seuils.map(s => s.filiere_id)
  const filieresDisponibles = filieres.filter(f => !filieresDejaPresentes.includes(f.id))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-display font-bold text-gray-800">
              {univInit ? `🏛 ${univInit.nom}` : '➕ Nouvelle université'}
            </h2>
            {univInit && <p className="text-xs text-gray-400 mt-0.5">📍 {univInit.ville}</p>}
          </div>
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

          {/* ── Section 1 : Infos université ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Informations générales
            </h3>
            <form onSubmit={handleSaveUniv} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input className="input-field text-sm" placeholder="Université d'Abomey-Calavi"
                    value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Ville *</label>
                  <input className="input-field text-sm" placeholder="Cotonou"
                    value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Site web</label>
                  <input className="input-field text-sm" placeholder="https://..."
                    value={form.site_web} onChange={e => setForm(f => ({ ...f, site_web: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <textarea className="input-field text-sm" rows="2"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="est_publique" checked={form.est_publique}
                    onChange={e => setForm(f => ({ ...f, est_publique: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-500" />
                  <label htmlFor="est_publique" className="text-sm text-gray-700">Établissement public</label>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary text-sm w-full">
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les infos'}
              </button>
            </form>
          </div>

          {/* ── Section 2 : Filières proposées (seulement si université existante) ── */}
          {univInit && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                Filières proposées
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {seuils.length}
                </span>
              </h3>

              {loadingSeuils ? (
                <div className="text-center py-4 text-gray-400 text-sm animate-pulse">Chargement...</div>
              ) : (
                <>
                  {/* Liste des filières existantes */}
                  <div className="space-y-2 mb-4">
                    {seuils.length === 0 && (
                      <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Aucune filière — ajoutez-en une ci-dessous
                      </div>
                    )}

                    {seuils.map(s => (
                      <div key={s.id} className="border border-gray-100 rounded-xl overflow-hidden">
                        {/* En-tête filière */}
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50">
                          <div>
                            <span className="text-sm font-semibold text-gray-800">{s.filiere_nom || `Filière #${s.filiere_id}`}</span>
                  {s.filiere_code && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-1">{s.filiere_code}</span>}
                            <span className="text-xs text-gray-400 ml-2">{s.annee} · {s.places_disponibles} places</span>
                          </div>
                          <div className="flex gap-1">
                            {editingSeuil === s.id ? (
                              <>
                                <button onClick={() => handleSaveSeuil(s)}
                                  className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg hover:bg-emerald-600 font-medium">
                                  ✓ OK
                                </button>
                                <button onClick={() => setEditingSeuil(null)}
                                  className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg">
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditSeuil(s)}
                                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">
                                  ✏️ Modifier
                                </button>
                                <button onClick={() => handleDeleteSeuil(s)}
                                  className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100">
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Seuils — mode affichage ou édition */}
                        {editingSeuil === s.id ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white">
                            {[
                              { key: 'seuil_minimum', label: 'Min (payant)', color: 'text-orange-600' },
                              { key: 'seuil_demi_bourse', label: '½ Bourse', color: 'text-blue-600' },
                              { key: 'seuil_bourse', label: 'Bourse', color: 'text-emerald-600' },
                              { key: 'places_disponibles', label: 'Places', color: 'text-gray-600' },
                            ].map(({ key, label, color }) => (
                              <div key={key}>
                                <label className={`text-xs font-semibold ${color} mb-1 block`}>{label}</label>
                                <input
                                  type="number"
                                  step={key === 'places_disponibles' ? '1' : '0.25'}
                                  min="0"
                                  max={key === 'places_disponibles' ? '9999' : '20'}
                                  className="input-field text-sm text-center py-1"
                                  value={editSeuilForm[key]}
                                  onChange={e => setEditSeuilForm(f => ({ ...f, [key]: e.target.value }))}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3 px-3 py-2 bg-white text-xs">
                            <span className="text-orange-600">Min: <strong>{s.seuil_minimum}/20</strong></span>
                            <span className="text-blue-600">½ Bourse: <strong>{s.seuil_demi_bourse}/20</strong></span>
                            <span className="text-emerald-600">Bourse: <strong>{s.seuil_bourse}/20</strong></span>
                            <span className="text-gray-500">Places: <strong>{s.places_disponibles}</strong></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Formulaire ajout nouvelle filière */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-3">➕ Ajouter une filière</p>
                    <form onSubmit={handleAddSeuil} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Filière *</label>
                          <select className="input-field text-sm" value={seuilForm.filiere_id}
                            onChange={e => setSeuilForm(f => ({ ...f, filiere_id: e.target.value }))} required>
                            <option value="">-- Choisir une filière --</option>
                            {filieresDisponibles.map(f => {
                              const hasNoSeries = !f.series_acceptees || f.series_acceptees.length === 0
                              return (
                                <option key={f.id} value={f.id}>
                                  {f.code} — {f.nom}{hasNoSeries ? ' ⚠️ (aucune série)' : ''}
                                </option>
                              )
                            })}
                          </select>
                          {filieresDisponibles.length === 0 && (
                            <p className="text-xs text-blue-600 mt-1">✅ Toutes les filières ont été ajoutées</p>
                          )}
                          {filieresDisponibles.some(f => !f.series_acceptees || f.series_acceptees.length === 0) && (
                            <p className="text-xs text-orange-500 mt-1">
                              ⚠️ Les filières marquées ⚠️ n'ont pas de séries configurées et ne seront pas suggérées aux étudiants.
                              Configurez-les d'abord dans l'onglet <strong>Filières</strong>.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Année</label>
                          <input type="number" className="input-field text-sm" value={seuilForm.annee}
                            onChange={e => setSeuilForm(f => ({ ...f, annee: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Places</label>
                          <input type="number" min="0" className="input-field text-sm" value={seuilForm.places_disponibles}
                            onChange={e => setSeuilForm(f => ({ ...f, places_disponibles: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-orange-600 mb-1 block">Seuil min (payant) *</label>
                          <input type="number" step="0.25" min="0" max="20" className="input-field text-sm"
                            placeholder="ex: 10" value={seuilForm.seuil_minimum}
                            onChange={e => setSeuilForm(f => ({ ...f, seuil_minimum: e.target.value }))} required />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-600 mb-1 block">Seuil ½ bourse *</label>
                          <input type="number" step="0.25" min="0" max="20" className="input-field text-sm"
                            placeholder="ex: 13" value={seuilForm.seuil_demi_bourse}
                            onChange={e => setSeuilForm(f => ({ ...f, seuil_demi_bourse: e.target.value }))} required />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-emerald-600 mb-1 block">Seuil bourse complète *</label>
                          <input type="number" step="0.25" min="0" max="20" className="input-field text-sm"
                            placeholder="ex: 16" value={seuilForm.seuil_bourse}
                            onChange={e => setSeuilForm(f => ({ ...f, seuil_bourse: e.target.value }))} required />
                        </div>
                      </div>
                      <button type="submit" className="btn-secondary text-sm w-full">
                        + Ajouter cette filière
                      </button>
                    </form>
                  </div>
                </>
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
export default function GestionUniversites() {
  const [universites, setUniversites] = useState([])
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalUniv, setModalUniv] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [u, f] = await Promise.all([getUniversites(), getFilieres()])
      setUniversites(u.data)
      setFilieres(f.data)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette université ?')) return
    try { await deleteUniversite(id); load() }
    catch { setError('Impossible de supprimer') }
  }

  const filtered = universites.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.ville.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-400 animate-pulse">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">
          Universités
          <span className="ml-2 text-sm font-normal text-gray-400">({universites.length})</span>
        </h2>
        <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
          + Nouvelle université
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">⚠️ {error}</div>
      )}

      <input className="input-field text-sm" placeholder="🔍 Rechercher..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="card border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{u.nom}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.est_publique ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                    {u.est_publique ? 'Publique' : 'Privée'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  📍 {u.ville}
                  {u.site_web && <> · <a href={u.site_web} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{u.site_web}</a></>}
                </div>
                {u.description && <p className="text-xs text-gray-500 mt-1 truncate">{u.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setModalUniv(u)}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-xs bg-red-50 text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-100"
                >🗑️</button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">Aucune université trouvée</div>
        )}
      </div>

      {modalUniv && (
        <ModalUniversite
          key={modalUniv.id}
          univInit={modalUniv}
          filieres={filieres}
          onClose={() => { setModalUniv(null); load() }}
          onSaved={load}
        />
      )}

      {showNewModal && (
        <ModalUniversite
          univInit={null}
          filieres={filieres}
          onClose={() => { setShowNewModal(false); load() }}
          onSaved={load}
        />
      )}
    </div>
  )
}
