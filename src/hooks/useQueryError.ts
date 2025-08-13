import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useQueryError(setError: (msg: string) => void) {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [location, setError]);
}
