import React from 'react';
import { useAuth } from '../auth/useAuth';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '24px',
      fontFamily: 'monospace',
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
        LogStream
      </div>
      <div style={{ fontSize: '14px', color: '#888' }}>
        Sign in to access log streaming
      </div>
      <button
        onClick={login}
        style={{
          padding: '10px 28px',
          fontSize: '14px',
          fontFamily: 'monospace',
          cursor: 'pointer',
          border: '1px solid #555',
          borderRadius: '4px',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        Sign in with SSO
      </button>
    </div>
  );
}
