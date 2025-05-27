import crmFeaturesByAccountIdJson from '../config/crmFeaturesByAccountId.json';

export type CRMFeatureMetadata = {
  isEnableAccount?: boolean;
  isEnableOpportunities?: boolean;
  isEnableContacts?: boolean;
};
export const allEnableCRMFeatures: CRMFeatureMetadata = {
  isEnableAccount: true,
  isEnableOpportunities: true,
  isEnableContacts: true,
};
const crmFeaturesByAccountId: Record<string, CRMFeatureMetadata> = crmFeaturesByAccountIdJson;

export function getCRMFeatureMetadata(accountId: string): CRMFeatureMetadata {
  return   {...allEnableCRMFeatures,  ...(crmFeaturesByAccountId[accountId] || {})};
}

export function isMetadataEnabled(accountId: string, metadataKey: keyof CRMFeatureMetadata): boolean {
  const metadata = getCRMFeatureMetadata(accountId);
  return !!metadata[metadataKey];
} 