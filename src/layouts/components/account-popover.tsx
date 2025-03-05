import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useRouter, usePathname } from 'src/routes/hooks';
import { _myAccount } from 'src/_mock';
import { removeToken, removeAccountId } from 'src/utils/auth';
import store from 'src/libs/stores';
import { HomePageApi } from 'src/libs/service/pillar/home';
import { ContentPageApi } from 'src/libs/service/content/content';
import { ChannelApi } from 'src/libs/service/channel/channel';
import { AnalyticsPageApi } from 'src/libs/service/analytics/analytics';
import { RouterLink } from 'src/routes/components';
import Link from '@mui/material/Link';
import { useGetProfileQuery } from 'src/libs/service/profile/profile';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

interface Profile {
  id: string;
  oauth_display_name: string | null;
  custom_display_name: string;
  email: string;
  photo_url: string;
}

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();

  const pathname = usePathname();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const { data: profileData, isLoading, refetch } = useGetProfileQuery();
  const [profile, setProfile] = useState<Profile>();


  useEffect(() => {
    if (!isLoading && profileData) {
      setProfile(profileData.data[0]);
    }
  }, [isLoading, profileData]);



  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  const handleLogout = useCallback(() => {

    store.dispatch(HomePageApi.util.resetApiState());
    store.dispatch(ContentPageApi.util.resetApiState());
    store.dispatch(ChannelApi.util.resetApiState());
    store.dispatch(AnalyticsPageApi.util.resetApiState());
    removeToken();
    removeAccountId();
    sessionStorage.clear();
    localStorage.clear()
    router.push('/sign-in')
  }, []);

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar 
          src={profile?.photo_url} 
          alt={profile?.custom_display_name} 
          sx={{ width: 1, height: 1 }}
        >
          {profile?.custom_display_name}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {profile?.custom_display_name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {profile?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button  onClick={handleLogout} fullWidth color="error" size="medium" variant="text">
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
