import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ResetPasswordRequestPage = lazy(() => import('src/pages/reset-password-request'));
export const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CreateIdeaPage = lazy(() => import('src/pages/create-idea'));
export const ContentItemPage = lazy(() => import('src/pages/content-item'));
export const PillarItemPage = lazy(() => import('src/pages/pillar-item'));
export const ContentPage = lazy(() => import('src/pages/content'));
export const AnalyticsPage = lazy(() => import('src/pages/analytics'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const AddChannelPage = lazy(() => import('src/pages/add-channel'));
export const SelectAccountPage = lazy(() => import('src/pages/select-account'));


// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <ContentPage />, index: true },
        { path: 'strategy', element: <HomePage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'create', element: <CreateIdeaPage /> },
        { path: 'content', element: <ContentPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'content/:content-id', element: <ContentItemPage /> },
        { path: 'pillar/:pillar-id', element: <PillarItemPage /> },
        { path: 'add-channel', element: <AddChannelPage /> },
      ],
    },
    {
      path: 'auth',
      element: (
        <AuthLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </AuthLayout>
      ),
      children: [
        { path: 'sign-in', element: <SignInPage /> },
        { path: 'sign-up', element: <SignUpPage /> },
        { path: 'reset-password-request', element: <ResetPasswordRequestPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
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
