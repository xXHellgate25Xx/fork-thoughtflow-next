import { configureStore } from '@reduxjs/toolkit';

import { WixApi } from './service/wix/wix';
import { authApi } from './service/auth/auth';
import { IdeaApi } from './service/idea/idea';
import { HomePageApi } from './service/pillar/home';
import { AccountApi } from './service/account/account';
import { ChannelApi } from './service/channel/channel';
import { ProfileApi } from './service/profile/profile';
import { RepurposeApi } from './service/idea/repurpose';
import exampleSlice from './service/example/exampleSlice';
import { ContentPageApi } from './service/content/content';
import { PillarPageApi } from './service/pillar/pillar-item';
import { generateContentApi } from './service/content/generate';
import { AnalyticsPageApi } from './service/analytics/analytics';
import { generalService } from './service/airtable/generalService';
import { uploadToStorageApi } from './service/storage/api-storage';

const store = configureStore({
  reducer: {
    example: exampleSlice, // Add your reducers here
    [authApi.reducerPath]: authApi.reducer,
    [HomePageApi.reducerPath]: HomePageApi.reducer,
    [IdeaApi.reducerPath]: IdeaApi.reducer,
    [uploadToStorageApi.reducerPath]: uploadToStorageApi.reducer,
    [PillarPageApi.reducerPath]: PillarPageApi.reducer,
    [ContentPageApi.reducerPath]: ContentPageApi.reducer,
    [WixApi.reducerPath]: WixApi.reducer,
    [generateContentApi.reducerPath]: generateContentApi.reducer,
    [AnalyticsPageApi.reducerPath]: AnalyticsPageApi.reducer,
    [AccountApi.reducerPath]: AccountApi.reducer,
    [ProfileApi.reducerPath]: ProfileApi.reducer,
    [ChannelApi.reducerPath]: ChannelApi.reducer,
    [RepurposeApi.reducerPath]: RepurposeApi.reducer,
    [generalService.reducerPath]: generalService.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(IdeaApi.middleware)
      .concat(HomePageApi.middleware)
      .concat(uploadToStorageApi.middleware)
      .concat(PillarPageApi.middleware)
      .concat(ContentPageApi.middleware)
      .concat(WixApi.middleware)
      .concat(generateContentApi.middleware)
      .concat(AnalyticsPageApi.middleware)
      .concat(AccountApi.middleware)
      .concat(ProfileApi.middleware)
      .concat(ChannelApi.middleware)
      .concat(RepurposeApi.middleware)
      .concat(generalService.middleware)
});

export default store;
