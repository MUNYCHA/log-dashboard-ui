import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import AuthGuard from './auth/AuthGuard.jsx';
import CallbackPage from './auth/CallbackPage.jsx';
import SplashScreen from './components/common/SplashScreen.jsx';

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);
  const onDone = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onDone={onDone} />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/*" element={
              <AuthGuard>
                <App />
              </AuthGuard>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

export default Root;
