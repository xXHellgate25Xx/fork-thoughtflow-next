import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './service/auth/auth';
import exampleSlice from './service/example/exampleSlice';


const store = configureStore({
  reducer: {
    example: exampleSlice,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export default store;
