import { useState, useEffect } from 'react'
import { getSeuils, createSeuil, updateSeuil, deleteSeuil, getUniversites, getFilieres } from '../../api/client'

const emptyForm = {
  universite_id: '', filiere_id: '', annee: new Date().getFullYear(),
  seuil_minimum: '', seuil_demi_bourse: '', seuil_bourse: '', places_disponibles: 0
}

export default function GestionSeuils() {
  const [seuils, setSeuils] = useState([])
  const [universites, setUniversites] = useState([])
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [filterUniv, setFilterUniv] = useState('')
  const [filterFil, setFilterFil] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [s, u, f] = await Promise.all([getSeuils(), getUniversites(), getFilieres()])
      setSeuils(s.data)
      setUniversites(u.data)
      setFilieres(f.data)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      universite_id: parseInt(form.universite_id),
      filiere_id: parseInt(form.filiere_id),
      annee: parseInt(form.annee),
      seuil_minimum: parseFloat(form.seuil_minimum),
      seuil_demi_bourse: parseFloat(form.seuil_demi_bourse),
      seuil_bourse: parseFloat(form.seuil_bourse),
      places_disponibles: parseInt(form.places_disponibles),
    }
    try {
      if (editing) await updateSeuil(editing.id, payload)
      else await createSeuil(payload)
      setForm(emptyForm); setEditing(null); setShowForm(false); load()
    } catch (err) { setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur') }
  }

  const handleEdit = (s) => {
    setEditing(s)
    setForm({
      universite_id: s.universite?.id || '',
      filiere_id: s.filiere || '',
      annee: s.annee,
      seuil_minimum: s.seuil_minimum,
      seuil_demi_bourse: s.seuil_demi_bourse,
      seuil_bourse: s.seuil_bourse,
      places_disponibles: s.places_disponibles,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce seuil ?')) return
    try { await deleteSeuil(id); load() }
    catch { setError('Impossible de supprimer') }
  }

  const filtered = seuils.filter(s => {
    const univMatch = !filterUniv || s.universite?.id === parseInt(filterUniv)
    const filMatch = !filterFil || s.filiere === parseInt(filterFil)
    return univMatch && filMatch
  })

  if (loading) return <div className="py-12 text-center text-gray-400 animate-pulse">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">Seuils d'admission ({seuils.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm) }}
          className="btn-primary text-sm"
        >
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card border border-emerald-200 space-y-3">
          <h3 className="font-semibold text-gray-700">{editing ? 'Modifier le seuil' : 'Nouveau seuil'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Université *</label>
              <select className="input-field text-sm" value={form.universite_id}
                onChange={e => setForm(f => ({ ...f, universite_id: e.target.value }))} required>
                <option value="">-- Université --</option>
                {universites.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Filière *</label>
              <select className="input-field text-sm" value={form.filiere_id}
                onChange={e => setForm(f => ({ ...f, filiere_id: e.target.value }))} required>
                <option value="">-- Filière --</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.code} – {f.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Année *</label>
              <input type="number" className="input-field text-sm" value={form.annee}
                onChange={e => setForm(f => ({ ...f, annee: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Places disponibles</label>
              <input type="number" min="0" className="input-field text-sm" value={form.places_disponibles}
                onChange={e => setForm(f => ({ ...f, places_disponibles: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Seuil minimum <span className="text-orange-500">(payant)</span> *
              </label>
              <input type="number" step="0.25" min="0" max="20" className="input-field text-sm" value={form.seuil_minimum}
                onChange={e => setForm(f => ({ ...f, seuil_minimum: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Seuil demi-bourse <span className="text-blue-500">(50%)</span> *
              </label>
              <input type="number" step="0.25" min="0" max="20" className="input-field text-sm" value={form.seuil_demi_bourse}
                onChange={e => setForm(f => ({ ...f, seuil_demi_bourse: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Seuil bourse complète <span className="text-emerald-500">(100%)</span> *
              </label>
              <input type="number" step="0.25" min="0" max="20" className="input-field text-sm" value={form.seuil_bourse}
                onChange={e => setForm(f => ({ ...f, seuil_bourse: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm">{editing ? 'Enregistrer' : 'Créer'}</button>
        </form>
      )}

      {/* Filtres */}
      <div className="grid grid-cols-2 gap-3">
        <select className="input-field text-sm" value={filterUniv} onChange={e => setFilterUniv(e.target.value)}>
          <option value="">Toutes les universités</option>
          {universites.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
        </select>
        <select className="input-field text-sm" value={filterFil} onChange={e => setFilterFil(e.target.value)}>
          <option value="">Toutes les filières</option>
          {filieres.map(f => <option key={f.id} value={f.id}>{f.code}</option>)}
        </select>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="card border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{s.universite?.nom}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Filière #{s.filiere}</span>
                  <span className="text-xs text-gray-400">{s.annee}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-orange-600">Min: <span className="font-bold">{s.seuil_minimum}/20</span></span>
                  <span className="text-blue-600">½ Bourse: <span className="font-bold">{s.seuil_demi_bourse}/20</span></span>
                  <span className="text-emerald-600">Bourse: <span className="font-bold">{s.seuil_bourse}/20</span></span>
                  <span className="text-gray-400">{s.places_disponibles} places</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(s)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">✏️</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">Aucun seuil trouvé</div>
      )}
    </div>
  )
}
