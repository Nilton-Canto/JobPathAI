import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Variáveis globais e reset
import './styles/index.css' // Estilos modulares organizados (layout, components, forms, pages, chat)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
