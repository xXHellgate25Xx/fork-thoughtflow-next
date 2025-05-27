import { lazy, Suspense } from 'react';
import { Navigate, Outlet, RouteObject, useRoutes } from 'react-router-dom';

import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { getCRMFeatureMetadata } from 'src/utils/crmFeatures';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/auth/sign-up'));
export const ResetPasswordRequestPage = lazy(() => import('src/pages/auth/reset-password-request'));
export const ResetPasswordPage = lazy(() => import('src/pages/auth/reset-password'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CreateIdeaPage = lazy(() => import('src/pages/create-idea'));
export const ContentItemPage = lazy(() => import('src/pages/content-item'));
export const PillarItemPage = lazy(() => import('src/pages/pillar-item'));
export const ContentPage = lazy(() => import('src/pages/content'));
export const IdeaListingPage = lazy(() => import('src/pages/idea-listing'));
export const AnalyticsPage = lazy(() => import('src/pages/analytics'));
export const AddChannelPage = lazy(() => import('src/pages/add-channel'));
export const SelectAccountPage = lazy(() => import('src/pages/select-account'));
export const CRMPage = lazy(() => import('src/pages/CRMPage'));
export const OpportunitiesCRMPage = lazy(() => import('src/pages/OpportunitiesCRMPage'));
export const AccountsCRMPage = lazy(() => import('src/pages/AccountsCRMPage'));
export const ContactsCRMPage = lazy(() => import('src/pages/ContactsCRMPage'));
export const OauthCallbackPage = lazy(() => import('src/pages/auth/oauthCallbackPage'));
export const LinkedInIntegrationPopup = lazy(() => import('src/pages/linkedin-integration-popup'));
export const SurveyConfigPage = lazy(() => import('src/pages/SurveyConfigPage'));
export const IdeaItemPage = lazy(() => import('src/pages/idea-item'));

// ----------------------------------------------------------------------

export function Router() {
  const accountId = localStorage.getItem('accountId') || '';
  const metadata = getCRMFeatureMetadata(accountId);
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <Navigate to="/idea" replace />, index: true },
        { path: 'idea', element: <IdeaListingPage /> },
        { path: 'strategy', element: <HomePage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'create', element: <CreateIdeaPage /> },
        { path: 'content', element: <ContentPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'content/:content-id', element: <ContentItemPage /> },
        { path: 'pillar/:pillar-id', element: <PillarItemPage /> },
        { path: 'add-channel', element: <AddChannelPage /> },
        { path: 'linkedin-integration-popup', element: <LinkedInIntegrationPopup /> },
        { path: 'idea/:idea-id', element: <IdeaItemPage /> },
        {
          path: 'crm',
          element: <CRMPage />,
          children: [
            { path: '', element: <Navigate to="/crm/opportunities" replace /> },
            { path: 'opportunities', element: <OpportunitiesCRMPage /> },
            metadata.isEnableAccount && { path: 'accounts', element: <AccountsCRMPage /> },
            { path: 'contacts', element: <ContactsCRMPage /> },
            // { path: 'survey-config', element: <SurveyConfigPage /> },
          ].filter(Boolean) as RouteObject[]
        },
      ],
    },
    {
      path: 'auth',
      element: (
        <AuthLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </AuthLayout>
      ),
      children: [
        { path: 'sign-in', element: <SignInPage /> },
        { path: 'sign-up', element: <SignUpPage /> },
        { path: 'reset-password-request', element: <ResetPasswordRequestPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
        { path: 'callback-oauth', element: <OauthCallbackPage /> },
      ],
    },
    {
      path: 'select-account',
      element: (
        <AuthLayout>
          <SelectAccountPage />
        </AuthLayout>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
