import { useState, useEffect } from 'react'
import { getMatieres, createMatiere, updateMatiere, deleteMatiere } from '../../api/client'

export default function GestionMatieres() {
  const [matieres, setMatieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', nom: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await getMatieres()
      setMatieres(r.data)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await updateMatiere(editing.id, form)
      else await createMatiere(form)
      setForm({ code: '', nom: '' })
      setEditing(null)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur')
    }
  }

  const handleEdit = (m) => {
    setEditing(m)
    setForm({ code: m.code, nom: m.nom })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return
    try { await deleteMatiere(id); load() }
    catch { setError('Impossible de supprimer (matière utilisée ?)') }
  }

  const filtered = matieres.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-400 animate-pulse">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">Matières ({matieres.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ code: '', nom: '' }) }}
          className="btn-primary text-sm"
        >
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card border border-emerald-200 space-y-3">
          <h3 className="font-semibold text-gray-700">{editing ? 'Modifier' : 'Nouvelle matière'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Code *</label>
              <input className="input-field text-sm" placeholder="ex: MATH" value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
              <input className="input-field text-sm" placeholder="ex: Mathématiques" value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm">{editing ? 'Enregistrer' : 'Créer'}</button>
        </form>
      )}

      <input
        className="input-field text-sm"
        placeholder="🔍 Rechercher une matière..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(m => (
          <div key={m.id} className="card border border-gray-100 flex items-center justify-between py-2.5">
            <div>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2">{m.code}</span>
              <span className="text-sm font-medium text-gray-800">{m.nom}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(m)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">✏️</button>
              <button onClick={() => handleDelete(m.id)} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">Aucune matière trouvée</div>
      )}
    </div>
  )
}
