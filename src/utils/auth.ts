import { jwtDecode } from "jwt-decode";


export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};

export const removeAccountId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accountId');
    localStorage.removeItem('accountName');
  }
}

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded: { exp?: number } = jwtDecode(token);

    return decoded.exp !== undefined && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
