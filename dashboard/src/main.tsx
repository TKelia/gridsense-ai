import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './i18n'
import { ThemeProvider } from './theme'
import { AuthProvider } from './auth'
import { HouseholdProvider } from './household'
import { WorkspaceProvider } from './workspace'
import { LandlordProvider } from './landlord'
import { CartProvider } from './cart'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ThemeProvider>
        <AuthProvider>
          <HouseholdProvider>
            <WorkspaceProvider>
              <LandlordProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </LandlordProvider>
            </WorkspaceProvider>
          </HouseholdProvider>
        </AuthProvider>
      </ThemeProvider>
    </LangProvider>
  </StrictMode>,
)
