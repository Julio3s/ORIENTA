import { useEffect, useState } from 'react'

const ITEMS = [
  { text: 'Médecine Générale',         icon: '🩺' },
  { text: 'Génie Informatique',         icon: '💻' },
  { text: 'Droit',                      icon: '⚖️' },
  { text: 'Pharmacie',                  icon: '💊' },
  { text: 'Génie Civil',                icon: '🏗️' },
  { text: 'Économie & Gestion',         icon: '📈' },
  { text: 'Licence Informatique',       icon: '🖥️' },
  { text: 'Agronomie',                  icon: '🌱' },
  { text: 'Lettres & Langues',          icon: '📖' },
  { text: 'Comptabilité',               icon: '🧾' },
  { text: 'Médecin',                    icon: '👨‍⚕️' },
  { text: 'Ingénieur Logiciel',         icon: '⚙️' },
  { text: 'Avocat',                     icon: '👨‍⚖️' },
  { text: 'Pharmacien',                 icon: '💉' },
  { text: 'Architecte',                 icon: '📐' },
  { text: 'Économiste',                 icon: '💹' },
  { text: 'Data Scientist',             icon: '📊' },
  { text: 'Agronome',                   icon: '🌾' },
  { text: 'Traducteur',                 icon: '🌍' },
  { text: 'Expert-Comptable',           icon: '🔢' },
  { text: 'Chirurgien',                 icon: '🔬' },
  { text: 'Développeur Web',            icon: '🌐' },
  { text: 'Magistrat',                  icon: '🏛️' },
  { text: 'Ingénieur Civil',            icon: '🏢' },
  { text: 'Directeur Financier',        icon: '💰' },
]

// Répartir en 3 colonnes décalées
const COL1 = ITEMS.filter((_, i) => i % 3 === 0)
const COL2 = ITEMS.filter((_, i) => i % 3 === 1)
const COL3 = ITEMS.filter((_, i) => i % 3 === 2)

function ScrollColumn({ items, duration, direction = 'up', delay = 0 }) {
  // Dupliquer pour le défilement infini
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', flex: 1, height: '100%', position: 'relative' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: `scroll-${direction} ${duration}s linear ${delay}s infinite`,
        willChange: 'transform',
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.65)',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnimationIntro({ onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 8000),
      setTimeout(() => setStep(2), 9000),
      setTimeout(() => setStep(3), 7200),
      setTimeout(() => onDone(),   8000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <>
      {/* Keyframes injectées */}
      <style>{`
        @keyframes scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      <div
        onClick={onDone}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #0A1628 0%, #0F2044 40%, #1E3A8A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          opacity: step === 3 ? 0 : 1,
          transition: step === 3 ? 'opacity 0.8s ease' : 'none',
        }}
      >
        {/* ── Colonnes défilantes (background) ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          gap: '10px',
          padding: '0 10px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          opacity: 0.7,
        }}>
          <ScrollColumn items={COL1} duration={22} direction="up"   delay={0}  />
          <ScrollColumn items={COL2} duration={28} direction="down" delay={-5} />
          <ScrollColumn items={COL3} duration={18} direction="up"   delay={-9} />
        </div>

        {/* ── Halo central ── */}
        <div style={{
          position: 'absolute',
          width: '380px', height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* ── Contenu central ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: '0 24px',
        }}>

          {/* Icône */}
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
            opacity: step >= 0 ? 1 : 0,
            transform: step >= 0 ? 'scale(1)' : 'scale(0.6)',
            transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <span style={{ fontSize: '34px' }}>🎓</span>
          </div>

          {/* Logo */}
          <h1 style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(2.8rem, 9vw, 4.5rem)',
            letterSpacing: '-0.04em',
            color: 'white',
            lineHeight: 1,
            margin: 0,
            opacity: step >= 0 ? 1 : 0,
            transform: step >= 0 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
            textShadow: '0 2px 40px rgba(37,99,235,0.5)',
          }}>
            ORIENTA<span style={{ color: '#F59E0B' }}>+</span>
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: '1rem',
            color: 'rgba(147,197,253,0.85)',
            marginTop: '10px',
            letterSpacing: '0.01em',
            opacity: step >= 1 ? 1 : 0,
            transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            Orientation universitaire au Bénin
          </p>

          {/* Bouton */}
          <div style={{
            marginTop: '36px',
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '10px',
          }}>
            <button
              onClick={e => { e.stopPropagation(); onDone() }}
              style={{
                padding: '12px 36px',
                borderRadius: '12px',
                background: 'white',
                color: '#1E3A8A',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 700,
                fontSize: '0.9375rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.04)'
                e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,0,0,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)'
              }}
            >
              Commencer →
            </button>
            <span style={{
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              ou clique n'importe où
            </span>
          </div>
        </div>
      </div>
    </>
  )
}