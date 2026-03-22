import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Dashboard        from '../components/admin/Dashboard'
import GestionSeries    from '../components/admin/GestionSeries'
import GestionMatieres  from '../components/admin/GestionMatieres'
import GestionUniversites from '../components/admin/GestionUniversites'
import GestionFilieres  from '../components/admin/GestionFilieres'
import GestionSeuils    from '../components/admin/GestionSeuils'

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '◈', component: Dashboard },
  { id: 'series',      label: 'Séries',        icon: '📚', component: GestionSeries },
  { id: 'matieres',    label: 'Matières',      icon: '✏️', component: GestionMatieres },
  { id: 'universites', label: 'Universités',   icon: '🏛', component: GestionUniversites },
  { id: 'filieres',    label: 'Filières',      icon: '🎓', component: GestionFilieres },
  { id: 'seuils',      label: 'Seuils',        icon: '📊', component: GestionSeuils },
]

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('access_token')) navigate('/admin-login')
  }, [])

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/admin-login')
  }

  const Active = TABS.find(t => t.id === tab)?.component || Dashboard

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Topbar ── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        position: 'sticky', top: 0, zIndex: 40
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>O</div>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--blue-brand)' }}>ORIENTA</span>
                <span style={{ color: 'var(--accent)' }}>+</span>
              </span>
              <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>Admin</span>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a href="/" style={{ fontSize: '0.8rem', color: 'var(--blue-mid)', fontWeight: 500, textDecoration: 'none' }}>
                ← Voir le site
              </a>
              <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5"
                style={{ color: 'var(--danger)', borderColor: '#FECACA' }}>
                Déconnexion
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: 'DM Sans',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  borderBottom: tab === t.id ? '2px solid var(--blue-mid)' : '2px solid transparent',
                  color: tab === t.id ? 'var(--blue-mid)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: '0.85em' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 16px 48px' }}>
        <Active />
      </main>
    </div>
  )
}