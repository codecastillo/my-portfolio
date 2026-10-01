import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CyberpunkPortfolio from './App.jsx'

// A refresh starts at the top of the page, not where the reader left off or
// at a #section left in the address bar. A first visit keeps any #section in
// the address bar.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
const reloaded =
  performance.getEntriesByType('navigation')[0]?.type === 'reload'
if (reloaded && location.hash) {
  history.replaceState(null, '', location.pathname + location.search)
}
if (reloaded) window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CyberpunkPortfolio />
  </StrictMode>,
)
