import { AccountApi } from 'src/libs/service/account/account';
import { generalService } from 'src/libs/service/airtable/generalService';
import { AnalyticsPageApi } from 'src/libs/service/analytics/analytics';
import { authApi } from 'src/libs/service/auth/auth';
import { ChannelApi } from 'src/libs/service/channel/channel';
import { ContentPageApi } from 'src/libs/service/content/content';
import { generateContentApi } from 'src/libs/service/content/generate';
import { IdeaApi } from 'src/libs/service/idea/idea';
import { RepurposeApi } from 'src/libs/service/idea/repurpose';
import { linkedinApi } from 'src/libs/service/linkedin/linkedin';
import { HomePageApi } from 'src/libs/service/pillar/home';
import { PillarPageApi } from 'src/libs/service/pillar/pillar-item';
import { ProfileApi } from 'src/libs/service/profile/profile';
import { uploadToStorageApi } from 'src/libs/service/storage/api-storage';
import { WixApi } from 'src/libs/service/wix/wix';
import store from 'src/libs/stores';

/**
 * Resets all API states in the Redux store
 */
export const resetAllApiStates = () => {
  const apiServices = [
    authApi,
    HomePageApi,
    ContentPageApi,
    ChannelApi,
    AnalyticsPageApi,
    AccountApi,
    ProfileApi,
    IdeaApi,
    PillarPageApi,
    WixApi,
    generateContentApi,
    linkedinApi,
    RepurposeApi,
    generalService,
    uploadToStorageApi
  ];

  apiServices.forEach(api => {
    if (api.util && api.util.resetApiState) {
      store.dispatch(api.util.resetApiState());
    }
  });
}; 