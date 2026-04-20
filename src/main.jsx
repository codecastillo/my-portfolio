import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CyberpunkPortfolio from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CyberpunkPortfolio />
  </StrictMode>,
)
