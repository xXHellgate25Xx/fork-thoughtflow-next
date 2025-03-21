import { configureStore } from '@reduxjs/toolkit';
import { AccountApi } from './service/account/account';
import { generalService } from './service/airtable/generalService';
import { AnalyticsPageApi } from './service/analytics/analytics';
import { authApi } from './service/auth/auth';
import { ChannelApi } from './service/channel/channel';
import { ContentPageApi } from './service/content/content';
import { generateContentApi } from './service/content/generate';
import exampleSlice from './service/example/exampleSlice';
import { IdeaApi } from './service/idea/idea';
import { RepurposeApi } from './service/idea/repurpose';
import { HomePageApi } from './service/pillar/home';
import { PillarPageApi } from './service/pillar/pillar-item';
import { ProfileApi } from './service/profile/profile';
import { uploadToStorageApi } from './service/storage/api-storage';
import { WixApi } from './service/wix/wix';

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
