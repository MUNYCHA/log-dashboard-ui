import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import AuthGuard from './auth/AuthGuard.jsx'
import CallbackPage from './auth/CallbackPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* SSO redirects back to /callback with ?code=xxx */}
            <Route path="/callback" element={<CallbackPage />} />
            {/* All other routes are protected */}
            <Route path="/*" element={
              <AuthGuard>
                <App />
              </AuthGuard>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
