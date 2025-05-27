import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getContactPageConfig } from 'src/components/CRM/Contacts/config/contactPageConfig';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { CONFIG } from 'src/config-global';
import { useContactMasterData } from 'src/hooks/useContactMasterData';
import { selectCRMAuth } from 'src/libs/redux/crmSlice';
import ContactsCRMPageView from 'src/sections/crm/view/ContactsCRMPageView';
import { airtableLinkByAccountId } from 'src/hooks/useAirtableLink';
import CRMPageHeader from '../components/CRM/Shared/CRMPageHeader';

const ContactsCRMPage = () => {

    /// Hard code the Invest Migrate don't have account table so we don't need to fetch it
    const accountId = localStorage.getItem("accountId") || "";
    const {
        accounts: masterAccounts,
        isLoading: masterIsLoading,
        isError: masterIsError
    } = useContactMasterData();

    let accounts = masterAccounts;
    let isLoadingMasterData = masterIsLoading;
    let isMasterDataError = masterIsError;

    if (accountId === "5b7a773e-6095-4257-aff0-34ba1a99fe24") {
        accounts = [];
        isLoadingMasterData = false;
        isMasterDataError = false;
    }

    const CRMAuthState = useSelector(selectCRMAuth);

    const isLoading = isLoadingMasterData;
    const isError = isMasterDataError;

    if (isError) {
        return <div>Failed to load contact data</div>;
    }

    if (isLoading) {
        return <LoadingFallback />;
    }

    // Fixed the airtable link to use the accountId from local storage
    const airtableLink = airtableLinkByAccountId[accountId];

    const contactPageConfig = getContactPageConfig(
        accounts,
        CRMAuthState
    );
    return (
        <>
            <Helmet>
                <title>{`CRM: Contacts | ${CONFIG.appName}`}</title>
            </Helmet>
            <CRMPageHeader 
                breadcrumbs={[
                    { label: "CRM" },
                    { label: "Contacts" }
                ]} 
                airtableLink={airtableLink.contacts}
            >
                <ContactsCRMPageView config={contactPageConfig} />
            </CRMPageHeader>
        </>
    );
};

export default ContactsCRMPage; 