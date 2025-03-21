// Mock supabase client for now
export const supabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: (columns: string) => Promise.resolve({ data, error: null }),
      eq: (column: string, value: any) => Promise.resolve({ data, error: null }),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data, error: null }),
    }),
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      in: (column: string, values: any[]) => Promise.resolve({ data: [], error: null }),
      order: (column: string, { ascending = true } = {}) => ({
        eq: (col: string, val: any) => Promise.resolve({ data: [], error: null }),
        in: (col: string, vals: any[]) => Promise.resolve({ data: [], error: null }),
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.com/${path}` } }),
    }),
  },
}; 