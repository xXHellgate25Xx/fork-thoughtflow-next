import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

export const airtableBaseQuery = retry(fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_PUBLIC_BASE_URL}/functions/v1/api/crm`, // Supabase Edge Function URL
  credentials: "same-origin", 
  prepareHeaders: (headers) => {
    const token = localStorage?.getItem('accessToken') || import.meta.env.VITE_VITE_APP_SUPABASE_ANON_KEY;
    const accountId = localStorage?.getItem('accountId') || '';
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('account-id', accountId);
    return headers;
  },
}), { maxRetries: 1 });