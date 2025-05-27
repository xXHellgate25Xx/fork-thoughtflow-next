import { navData } from "src/layouts/config-nav-dashboard";
import { getCRMFeatureMetadata } from "src/utils/crmFeatures";

export const useNavbar = () => {
  const accountId = localStorage.getItem('accountId');
  const metadata = getCRMFeatureMetadata(accountId || ''); 
  
  return navData(metadata);
};


