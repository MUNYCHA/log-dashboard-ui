import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Handles the redirect back from DEC SSO after login.
// SSO sends the user to /callback?code=xxx — this page exchanges that code for a token.
const CallbackPage = () => {
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      console.error('SSO error:', error, params.get('error_description'));
      navigate('/', { replace: true });
      return;
    }

    if (!code) {
      navigate('/', { replace: true });
      return;
    }

    // TODO: Exchange the authorization code for a token using your DEC SSO token endpoint.
    // Typical OIDC token exchange (done server-side or via PKCE):
    //
    // const res = await fetch(`${config.sso.tokenUrl}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     grant_type: 'authorization_code',
    //     code,
    //     redirect_uri: config.sso.redirectUri,
    //     client_id: config.sso.clientId,
    //   }),
    // });
    // const { access_token, id_token } = await res.json();
    // const user = parseJwt(id_token); // decode user info from JWT
    // handleCallback(access_token, user);

    console.warn('CallbackPage: TODO — implement token exchange with DEC SSO');
    navigate('/', { replace: true });
  }, [handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
      <svg className="w-6 h-6 animate-spin text-[#8AB4F8]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
};

export default CallbackPage;
