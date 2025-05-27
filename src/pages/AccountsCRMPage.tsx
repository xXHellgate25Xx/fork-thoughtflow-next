import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getAccountPageConfig } from 'src/components/CRM/Accounts/config/accountPageConfig';
import CRMPageHeader from 'src/components/CRM/Shared/CRMPageHeader';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { CONFIG } from 'src/config-global';
import { useAccountMasterData } from 'src/hooks/useAccountMasterData';
import { airtableLinkByAccountId } from 'src/hooks/useAirtableLink';
import { selectCRMAuth } from 'src/libs/redux/crmSlice';
import AccountsCRMPageView from 'src/sections/crm/view/AccountsCRMPageView';
import { isMetadataEnabled } from 'src/utils/crmFeatures';

const AccountsCRMPage = () => {
    const {
        opportunities = [],
        contacts = [],
        owners = [],
        stages = [],
        stageActivityLogs = [],
        isLoading: isLoadingMasterData,
        isError: isMasterDataError
    } = useAccountMasterData();

    const CRMAuthState = useSelector(selectCRMAuth);

    const isLoading = isLoadingMasterData;
    const isError = isMasterDataError;

    if (isError) {
        return <div>Failed to load account data</div>;
    }

    if (isLoading) {
        return <LoadingFallback />;
    }

    // Fixed the airtable link to use the accountId from local storage
    const accountId = localStorage.getItem('accountId') || '';
    const airtableLink = airtableLinkByAccountId[accountId];

    // Feature toggle: Only show Accounts page if enabled for this accountId
    if (!isMetadataEnabled(accountId, 'isEnableAccount')) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Access Denied</h2>
                <p>{`You don't have permission to access the Accounts feature. Please contact your administrator.`}</p>
            </div>
        );
    }

    const accountPageConfig = getAccountPageConfig(
        opportunities,
        owners,
        stages,
        stageActivityLogs,
        contacts,
        CRMAuthState
    );

    return (
        <>
            <Helmet>
                <title>{`CRM: Accounts | ${CONFIG.appName}`}</title>
            </Helmet>
            <CRMPageHeader
                breadcrumbs={[
                    { label: "CRM" },
                    { label: "Accounts" }
                ]}
                airtableLink={airtableLink.accounts}
            >
                <AccountsCRMPageView config={accountPageConfig} />
            </CRMPageHeader>
        </>
    );
};

export default AccountsCRMPage; 