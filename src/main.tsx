import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './cms/admin.css'  // Import admin CSS globally
import App from './App.tsx'
import './firebase/config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
