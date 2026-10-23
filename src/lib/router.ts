import { useEffect, useState } from 'react';

export function useRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setPath(hash || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (p: string) => {
    window.location.hash = p;
  };

  return [path, navigate];
}
