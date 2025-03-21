import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';


import { Iconify } from 'src/components/iconify';

import { useLocation } from 'react-router-dom';
import { useGetAllAccountsQuery } from 'src/libs/service/account/account';
import { useRouter } from 'src/routes/hooks';

import { layoutClasses } from '../classes';
import { AccountPopover } from '../components/account-popover';
import { MenuButton } from '../components/menu-button';
import { navData } from '../config-nav-dashboard';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { DashboardContent, Main } from './main';
import { NavDesktop, NavMobile } from './nav';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();

  const [navOpen, setNavOpen] = useState(false);
  const [allAccount, setAllAccount] = useState<{ id: string; name: string }[]>([]);
  const location = useLocation();
  const state = location.state || {}; // Handle undefined state

  const layoutQuery: Breakpoint = 'lg';
  const router = useRouter();

  const allAccountsApiData = useGetAllAccountsQuery();
  const mapAllAccountsApi = (inputs: any[]) =>
    inputs.map((input) => ({
      id: String(input.id),
      name: String(input.name),
      // logo: '',
      // plan: '',
    })) || [];
  useEffect(() => {
    if (allAccountsApiData?.data?.data) {
      setAllAccount(mapAllAccountsApi(allAccountsApiData.data.data));
    }
  }, [allAccountsApiData]);

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                  workspaces={allAccount}
                />
              </>
            ),
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                {/* <Searchbar /> */}
                {/* <LanguagePopover data={_langs} />
                <NotificationsPopover data={_notifications} /> */}
                <AccountPopover
                  data={[
                    // {
                    //   label: 'Home',
                    //   href: '/',
                    //   icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                    // },
                    {
                      label: 'Profile',
                      href: 'profile',
                      icon: <Iconify width={22} icon="iconamoon:profile" />,
                    },
                    // {
                    //   label: 'Settings',
                    //   href: '/settings',
                    //   icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                    // },
                  ]}
                />
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={navData} layoutQuery={layoutQuery} workspaces={allAccount} />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <Main>
        <DashboardContent>
          {children}
        </DashboardContent>
      </Main>
    </LayoutSection>
  );
}
