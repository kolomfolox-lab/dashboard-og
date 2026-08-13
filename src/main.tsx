import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App';
import '@/index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Root() {
  const [GoogleOAuthProvider, setGoogleOAuthProvider] = useState<React.ComponentType<{ clientId: string; children: React.ReactNode }> | null>(null);

  useEffect(() => {
    if (googleClientId) {
      import('@react-oauth/google').then(mod => {
        setGoogleOAuthProvider(() => mod.GoogleOAuthProvider);
      }).catch(() => {
        // Google OAuth not available
      });
    }
  }, []);

  if (GoogleOAuthProvider && googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>,
);
