import { useEffect, useState } from 'react'
import PetComponent from './components/pet/PetComponent'
import './components/pet/pet.css'

export default function PetApp() {
  const [state, setState] = useState<'idle' | 'thinking' | 'action'>('idle')

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    const root = document.getElementById('root')
    if (root) root.style.background = 'transparent'
    
    const removeListener = window.nexusAPI.pet.onStateChange((newState: string) => {
      if (['idle', 'thinking', 'action'].includes(newState)) {
        setState(newState as any)
      }
    })

    return () => {
      removeListener()
    }
  }, [])

  return (
    <div className="pet-container">
      <PetComponent state={state} />
    </div>
  )
}
