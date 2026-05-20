import React from 'react'

interface PetProps {
  state: 'idle' | 'thinking' | 'action'
}

export default function PetComponent({ state }: PetProps) {
  // Determine colors based on state
  let coreColor = 'var(--color-neon-cyan, #00d2ff)'
  let ringColor = 'var(--color-neon-purple, #b53cff)'
  let glowColor = 'rgba(0, 210, 255, 0.4)'

  if (state === 'thinking') {
    coreColor = 'var(--color-warning, #ffaa00)'
    ringColor = 'var(--color-warning, #ffaa00)'
    glowColor = 'rgba(255, 170, 0, 0.4)'
  } else if (state === 'action') {
    coreColor = 'var(--color-neon-green, #00ffaa)'
    ringColor = 'var(--color-neon-green, #00ffaa)'
    glowColor = 'rgba(0, 255, 170, 0.5)'
  }

  return (
    <div className={`pet-wrapper pet-${state}`}>
      {/* Holographic glowing base */}
      <div className="pet-glow" style={{ boxShadow: `0 0 40px 10px ${glowColor}` }} />
      
      {/* Outer spinning ring */}
      <div className="pet-ring outer-ring" style={{ borderColor: ringColor, borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
      
      {/* Inner spinning ring */}
      <div className="pet-ring inner-ring" style={{ borderColor: coreColor, borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
      
      {/* Core Eye */}
      <div className="pet-core" style={{ background: coreColor, boxShadow: `0 0 20px ${coreColor}` }}>
        <div className="pet-pupil" />
      </div>

      {/* Cyberpunk details */}
      <div className="pet-details">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M 10,50 L 30,10 L 70,10 L 90,50 L 70,90 L 30,90 Z" fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
        </svg>
      </div>
      
      {/* State text tag */}
      <div className="pet-tag" style={{ color: coreColor, borderColor: coreColor }}>
        {state.toUpperCase()}
      </div>
    </div>
  )
}
