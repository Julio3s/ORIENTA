const CFG = {
  bourse:         { color: '#10B981', bg: '#D1FAE5', label: '🏆 Bourse complète' },
  demi_bourse:    { color: '#3B82F6', bg: '#DBEAFE', label: '🎓 Demi-bourse' },
  payant:         { color: '#F59E0B', bg: '#FEF3C7', label: '💳 Payant' },
  non_admissible: { color: '#EF4444', bg: '#FEE2E2', label: '✗ Non admissible' },
}

export default function BarreCompatibilite({ pourcentage, statut, showLabel = true, height = 'h-2' }) {
  const { color, label } = CFG[statut] || CFG.non_admissible
  const pct = Math.min(100, Math.max(0, pourcentage))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className={`progress-track ${height}`} style={{ height: height === 'h-2' ? '8px' : '10px' }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}BB, ${color})` }} />
      </div>
    </div>
  )
}