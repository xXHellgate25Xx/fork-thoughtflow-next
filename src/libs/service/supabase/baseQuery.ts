import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_PUBLIC_BASE_URL, // Supabase Edge Function URL
  credentials: "same-origin", 
  prepareHeaders: (headers) => {
    const token = localStorage?.getItem('jwt') || import.meta.env.VITE_VITE_APP_SUPABASE_ANON_KEY;
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
