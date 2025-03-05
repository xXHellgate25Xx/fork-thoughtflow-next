import { ReactNode, useEffect, useState } from 'react';
import { useGlobalContext } from 'src/GlobalContextProvider';
import { useRouter } from 'src/routes/hooks';
import { getToken, isTokenValid, removeToken } from 'src/utils/auth';

interface JWTAuthWrapperProps {
  children: ReactNode;
}

const excludePaths = ['/sign-in', '/sign-up'];

const JWTAuthWrapper: React.FC<JWTAuthWrapperProps> = ({ children }) => {
  const router = useRouter();

  const { setJwtToken } = useGlobalContext();
  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      setJwtToken(token);
    } else {
      removeToken();
      if (!excludePaths.includes(window.location.pathname)){
        router.push('/sign-in');
      }
    }
  }, [router,setJwtToken]);

  return <>{children}</>;
};

export default JWTAuthWrapper;
