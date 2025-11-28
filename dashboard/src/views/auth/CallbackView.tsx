import { IOSTokenStorage } from 'api/core/plugins';
import { Navigate, useLocation } from 'react-router-dom';
import { client, Keys } from 'stores';

export function CallbackView() {
  const location = useLocation();
  
  // Check URL parameters first (for Discord OAuth2 callback)
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get('token');
  
  // If no token in URL params, check fragment (existing format)
  if (!token) {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    token = fragment.get('token');
  }
  
  // Handle authentication error
  const error = urlParams.get('error');
  if (error) {
    alert('Authentication failed. Please try again.');
    return <Navigate to="/auth/signin" />;
  }

  if (token != null) {
    localStorage.setItem(IOSTokenStorage, token);
    localStorage.setItem('discord-token', token); // Also store in our format
    client.invalidateQueries(Keys.login);
  }

  return <Navigate to="/user/home" />;
}
