import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getOpportunityPageConfig } from 'src/components/CRM/Opportunities/config/opportunityPageConfig';
import CRMPageHeader from 'src/components/CRM/Shared/CRMPageHeader';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { CONFIG } from 'src/config-global';
import { airtableLinkByAccountId } from 'src/hooks/useAirtableLink';
import { useOpportunityMasterData } from 'src/hooks/useOpportunityMasterData';
import { selectCRMAuth } from 'src/libs/redux/crmSlice';
import OpportunitiesCRMPageView from 'src/sections/crm/view/OpportunitiesCRMPageView';
import { getCRMFeatureMetadata } from 'src/utils/crmFeatures';

const OpportunitiesCRMPage = () => {
    const accountId = localStorage.getItem('accountId') || '';
    const metadata = getCRMFeatureMetadata(accountId);
    const masterData = useOpportunityMasterData(metadata);
    const CRMAuthState = useSelector(selectCRMAuth);
    if (masterData.isError) {
        return <div>Failed to load opportunity data</div>;
    }
    if (masterData.loading.all) {
        return <LoadingFallback />;
    }

    // Fixed the airtable link to use the accountId from local storage
    const airtableLink = airtableLinkByAccountId[accountId];
    // if (!CRMAuthState.currentEmployee) {
    //     return <LoadingFallback />;
    // }
    const opportunityPageConfig = getOpportunityPageConfig(masterData, CRMAuthState, metadata);
    return (
        <>
            <Helmet>
                <title>{`CRM: Opportunities | ${CONFIG.appName}`}</title>
            </Helmet>
            <CRMPageHeader title="Opportunities" airtableLink={airtableLink.opportunities}>
                <OpportunitiesCRMPageView config={opportunityPageConfig} />
            </CRMPageHeader>
        </>
    );
};

export default OpportunitiesCRMPage; 