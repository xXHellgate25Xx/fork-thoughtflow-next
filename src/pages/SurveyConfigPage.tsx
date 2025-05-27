import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { useCRMAuth } from 'src/hooks/useCRMAuth';
import SurveyConfigPageView from 'src/sections/crm/view/SurveyConfigPageView';

const SurveyConfigPage = () => {
    const {
        canAccessCRM,
        isAdmin,
        currentEmployee: currentEmployeeName,
        permissions,
        checkPermission
    } = useCRMAuth();

    // Show loading indicator while checking permissions
    if (!canAccessCRM) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    // Only admins can access this page
    if (!isAdmin) {
        return <div>You are not authorized to access this page</div>;
    }


    return (
        <>
            <Helmet>
                <title>{`CRM: Survey Configuration | ${CONFIG.appName}`}</title>
            </Helmet>
            <SurveyConfigPageView />
        </>
    );
};

export default SurveyConfigPage; 