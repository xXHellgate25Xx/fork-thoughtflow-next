import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './service/auth/auth';
import { HomePageApi } from './service/home';
import exampleSlice from './service/example/exampleSlice';
import { IdeaApi } from './service/idea/idea';
import { uploadToStorageApi } from './service/storage/api-storage';
import { PillarPageApi } from './service/pillar-item';


const store = configureStore({
  reducer: {
    example: exampleSlice, // Add your reducers here
    [authApi.reducerPath]: authApi.reducer,
    [HomePageApi.reducerPath]: HomePageApi.reducer,
    [IdeaApi.reducerPath]: IdeaApi.reducer,
    [uploadToStorageApi.reducerPath]: uploadToStorageApi.reducer,
    [PillarPageApi.reducerPath]: PillarPageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware)
                          .concat(IdeaApi.middleware)
                          .concat(HomePageApi.middleware)
                          .concat(uploadToStorageApi.middleware)
                          .concat(PillarPageApi.middleware),
});


export default store;
