import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PetApp from './PetApp'
import './assets/main.css'

const isPetWindow = window.location.hash === '#/pet' || window.location.hash === '#pet'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isPetWindow ? <PetApp /> : <App />}
  </React.StrictMode>
)
