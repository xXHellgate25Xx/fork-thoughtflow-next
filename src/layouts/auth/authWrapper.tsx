import { ReactNode, useEffect, useState } from 'react';
import { useGlobalContext } from 'src/GlobalContextProvider';
import { useRouter } from 'src/routes/hooks';
import { getToken, isTokenValid } from 'src/utils/auth';

interface JWTAuthWrapperProps {
  children: ReactNode;
}

const JWTAuthWrapper: React.FC<JWTAuthWrapperProps> = ({ children }) => {
  const router = useRouter();

  const { setJwtToken } = useGlobalContext();
  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      setJwtToken(token);
    } else {
      router.push('/sign-in');
    }
  }, [router,setJwtToken]);

  return <>{children}</>;
};

export default JWTAuthWrapper;
