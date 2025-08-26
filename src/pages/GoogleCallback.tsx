import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';

function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function GoogleCallback({ onLogin }: { onLogin: (role: string) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const { token, redirect } = queryString.parse(window.location.search);
    console.log('GoogleCallback query:', { token, redirect }); // Debug log
    if (token && typeof token === 'string') {
      localStorage.setItem('token', token);
      const decoded = decodeJwt(token);
      if (onLogin && decoded && decoded.role) {
        onLogin(decoded.role);
      }
      let redirectPath = typeof redirect === 'string' ? redirect : '/';
      navigate(redirectPath, { replace: true });
    } else if (localStorage.getItem('token')) {
      const decoded = decodeJwt(localStorage.getItem('token')!);
      if (onLogin && decoded && decoded.role) {
        onLogin(decoded.role);
      }
      let redirectPath = '/';
      if (decoded && decoded.role) {
        if (["superadmin", "super-admin", "sub-superadmin"].includes(decoded.role)) {
          redirectPath = '/super-admin';
        } else if (["admin", "company_admin", "sub_admin"].includes(decoded.role)) {
          redirectPath = '/admin';
        }
      }
      navigate(redirectPath, { replace: true });
    } else {
      navigate('/signin?error=Google%20login%20failed', { replace: true });
    }
  }, [navigate, onLogin]);

  return <div>Signing you in with Google...</div>;
}
