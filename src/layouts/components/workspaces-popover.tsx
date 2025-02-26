import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
  }[];
};

export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
  const defaultData = {
    id: localStorage.getItem('accountId'),
    name: localStorage.getItem('accountName')
  }
  const [workspace, setWorkspace] = useState(defaultData);
  const router = useRouter();

  useEffect(() => {
    if (data.length > 0) {
      setWorkspace(defaultData);
    }

  }, [data]);

  useEffect(() => {
    let count = 0; // Counter to track iterations
    const maxIterations = 10; // Change this to limit the number of times it runs

    const interval = setInterval(() => {
      const storedId = localStorage.getItem("accountId");
      if (storedId !== workspace.id) {
        setWorkspace({
          id: storedId,
          name: localStorage.getItem("accountName")
        });
      }

      count += 1;
      if (count >= maxIterations) {
        clearInterval(interval);
      }
    }, 1000); // Runs every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // Runs when `workspace.id` changes

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[number]) => {
      setWorkspace(newValue);
      localStorage.setItem("accountId", newValue.id);
      localStorage.setItem("accountName", newValue.name);
      handleClosePopover();
      router.push('/');
      window.location.reload();
    },
    [handleClosePopover]
  );

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={handleOpenPopover}
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: 'left',
          justifyContent: 'flex-start',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          ...sx,
        }}
        {...other}
      >

        <Box
          gap={1}
          flexGrow={1}
          display="flex"
          alignItems="center"
          sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold' }}
        >
          {workspace?.name}
        </Box>

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>
      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover}>
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 260,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              p: 1.5,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: {
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
            >

              <Box component="span" sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>

              {option.id === workspace?.id && (
                <Label color="info" variant="soft">
                  CURRENT
                </Label>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
