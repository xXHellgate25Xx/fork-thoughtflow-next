import type { ReactNode} from 'react';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { getToken, removeToken, isTokenValid } from 'src/utils/auth';

import { useGlobalContext } from 'src/GlobalContextProvider';

interface JWTAuthWrapperProps {
  children: ReactNode;
}

const excludePaths = ['/auth/sign-in', '/auth/sign-up', '/auth/reset-password-request', '/auth/reset-password'];

const JWTAuthWrapper: React.FC<JWTAuthWrapperProps> = ({ children }) => {
  const router = useRouter();

  const { setJwtToken } = useGlobalContext();
  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      setJwtToken(token);
    } else {
      removeToken();
      if (!excludePaths.includes(window.location.pathname)) {
        router.push('/auth/sign-in');
      }
    }
  }, [router, setJwtToken]);

  return <>{children}</>;
};

export default JWTAuthWrapper;
