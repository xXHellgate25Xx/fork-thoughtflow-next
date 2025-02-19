import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

const AccountApi = createApi({
    reducerPath: "accountApi",
    baseQuery,
    endpoints: (builder) => ({
        // ------------------GET ALL CHANNELS OF USER--------------------------
        getAllAccounts: builder.query<any, void>({
          query: () => ({        
              url: `/functions/v1/api/account`,
              method: 'GET'
          }),
        })
    })
});

export const {
    useGetAllAccountsQuery
  } = AccountApi;
  export { AccountApi };
