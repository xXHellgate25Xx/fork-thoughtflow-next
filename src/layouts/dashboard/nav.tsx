import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';

import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, List, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';

import { WorkspacesPopover } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavItem = {
  path: string;
  title: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  children?: NavItem[];
};

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: {
    id: string;
    name: string;
  }[];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  // Automatically expand the parent item if a child is active
  useEffect(() => {
    const newOpenItems = { ...openItems };
    data.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname === child.path);
        if (isChildActive) {
          newOpenItems[item.title] = true;
        }
      }
    });
    setOpenItems(newOpenItems);
  }, [pathname]);

  const handleToggle = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderNavItem = (item: NavItem) => {
    const isParentActive = item.children
      ? item.children.some((child) => pathname === child.path)
      : false;
    const isActive = item.path === pathname || isParentActive;
    const isOpen = openItems[item.title] || false;

    if (item.children) {
      return (
        <Box key={item.title} sx={{ mb: 0.5 }}>
          <ListItemButton
            disableGutters
            onClick={() => handleToggle(item.title)}
            sx={{
              pl: 2,
              py: 1,
              gap: 2,
              pr: 1.5,
              borderRadius: 1,
              typography: 'body2',
              fontWeight: 'fontWeightMedium',
              bgcolor: isOpen ? 'action.selected' : 'transparent',
              color: isActive ? 'primary.main' : 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box component="span" sx={{ width: 24, height: 24, color: isActive ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </Box>

            <Box component="span" flexGrow={1} sx={{ color: isActive ? 'primary.main' : 'text.primary' }}>
              {item.title}
            </Box>

            {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </ListItemButton>

          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => {
                const isChildActive = child.path === pathname;

                return (
                  <ListItemButton
                    key={child.title}
                    disableGutters
                    component={RouterLink}
                    href={child.path}
                    sx={{
                      pl: 2,
                      py: 1,
                      ml: 3,
                      gap: 2,
                      pr: 1.5,
                      borderRadius: 1,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      bgcolor: isChildActive ? 'action.selected' : 'transparent',
                      color: isChildActive ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box component="span" sx={{ width: 24, height: 24, color: isChildActive ? 'primary.main' : 'text.secondary' }}>
                      {child.icon}
                    </Box>

                    <Box component="span" flexGrow={1} sx={{ color: isChildActive ? 'primary.main' : 'text.primary' }}>
                      {child.title}
                    </Box>

                    {child.info && child.info}
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem disableGutters disablePadding key={item.title} sx={{ mb: 0.5 }}>
        <ListItemButton
          disableGutters
          component={RouterLink}
          href={item.path}
          sx={{
            pl: 2,
            py: 1,
            gap: 2,
            pr: 1.5,
            borderRadius: 1,
            typography: 'body2',
            fontWeight: 'fontWeightMedium',
            color: isActive ? 'primary.main' : 'text.primary',
            bgcolor: isActive ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box component="span" sx={{ width: 24, height: 24, color: isActive ? 'primary.main' : 'text.secondary' }}>
            {item.icon}
          </Box>

          <Box component="span" flexGrow={1} sx={{ color: isActive ? 'primary.main' : 'text.primary' }}>
            {item.title}
          </Box>

          {item.info && item.info}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      {/* <Logo />  */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', my: '1rem', px: '1rem' }}>
        <Icon icon='fluent-emoji-flat:pen' fontSize='2rem' />
        <Typography variant='h4'>ThoughtFlow</Typography>
      </Box>

      {slots?.topArea}

      <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map(renderNavItem)}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      {/* <NavUpgrade /> */}
    </>
  );
}
