// src/pages/linkedin-integration-popup.tsx

import { useEffect } from 'react';

export default function LinkedInIntegrationPopup() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && window.opener) {
      window.opener.postMessage({ code }, window.origin);
      window.close();
    }
  }, []);

  return <div>Connecting to LinkedIn...</div>;
}