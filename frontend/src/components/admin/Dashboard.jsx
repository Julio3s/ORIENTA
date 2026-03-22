import { useState, useEffect } from 'react'
import { getSeries, getMatieres, getUniversites, getFilieres, getSeuils } from '../../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSeries(), getMatieres(), getUniversites(), getFilieres(), getSeuils()])
      .then(([s, m, u, f, se]) => {
        setStats({
          series: s.data.length,
          matieres: m.data.length,
          universites: u.data.length,
          filieres: f.data.length,
          seuils: se.data.length,
          universitesPub: u.data.filter(x => x.est_publique).length,
          universitesPrive: u.data.filter(x => !x.est_publique).length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Séries de Bac', value: stats?.series, icon: '📚', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Matières', value: stats?.matieres, icon: '✏️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Universités', value: stats?.universites, icon: '🏛', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Filières', value: stats?.filieres, icon: '🎓', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { label: 'Seuils configurés', value: stats?.seuils, icon: '📊', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-800">Tableau de bord</h2>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la base de données ORIENTA+</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card border animate-pulse h-24 bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`card border ${c.color} flex items-center gap-4`}>
              <span className="text-3xl">{c.icon}</span>
              <div>
                <div className="text-2xl font-display font-bold">{c.value ?? '—'}</div>
                <div className="text-xs font-medium opacity-80">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="card border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3">🏛 Répartition des universités</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.universites > 0 ? (stats.universitesPub / stats.universites) * 100 : 0}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs flex-shrink-0">
              <span className="text-emerald-700 font-semibold">Public: {stats.universitesPub}</span>
              <span className="text-purple-700 font-semibold">Privé: {stats.universitesPrive}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-3">💡 Guide d'utilisation</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">1.</span>
            <p>Créer les <strong>Séries</strong> de bac et leurs matières avec coefficients</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">2.</span>
            <p>Ajouter les <strong>Matières</strong> disponibles dans le système</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">3.</span>
            <p>Enregistrer les <strong>Universités</strong> avec leurs informations</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">4.</span>
            <p>Créer les <strong>Filières</strong> avec leurs 3 matières prioritaires et séries acceptées</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold flex-shrink-0">5.</span>
            <p>Configurer les <strong>Seuils</strong> (minimum, demi-bourse, bourse) pour chaque couple Université-Filière</p>
          </div>
        </div>
      </div>
    </div>
  )
}
