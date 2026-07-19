import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App.jsx'
import { SessionProvider } from './context/SessionContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import './design/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </SessionProvider>
  </StrictMode>,
)
