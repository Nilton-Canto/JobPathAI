import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Estilos globais (variáveis CSS, reset)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
