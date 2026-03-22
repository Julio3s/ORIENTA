import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const onSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await login(username, password)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      navigate('/admin')
    } catch { setError('Identifiants incorrects.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
            <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--blue-brand)' }}>ORIENTA</span>
            <span style={{ color: 'var(--accent)' }}>+</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>Espace administrateur</p>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(37,99,235,0.08)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', color: 'var(--ink)', fontFamily: 'DM Sans' }}>
            Connexion
          </h2>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                Nom d'utilisateur
              </label>
              <input type="text" className="input-field" placeholder="admin"
                value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#991B1B' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" style={{ marginTop: '4px', fontSize: '0.9375rem' }}>
              {loading ? '⏳ Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}