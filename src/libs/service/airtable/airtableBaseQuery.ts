import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const airtableBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_AIRTABLE_API_URL || 'https://api.airtable.com/v0/'),
  prepareHeaders: (headers) => {
    const apiKey =
      import.meta.env.VITE_AIRTABLE_API_KEY || localStorage?.getItem('airtableApiKey') || '';
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${apiKey}`);
    return headers;
  },
}); 
