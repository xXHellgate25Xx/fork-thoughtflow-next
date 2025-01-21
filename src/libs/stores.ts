import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './service/auth/auth';
import { HomePageApi } from './service/home';
import exampleSlice from './service/example/exampleSlice';


const store = configureStore({
  reducer: {
    example: exampleSlice,
    [authApi.reducerPath]: authApi.reducer,
    [HomePageApi.reducerPath]: HomePageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(HomePageApi.middleware),
});

export default store;
