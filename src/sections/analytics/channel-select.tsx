import { useState, useCallback } from 'react';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';

import { channelIcons } from 'src/theme/icons/channel-icons';
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

type ChannelSelectProps = ButtonProps & {
  channelId: string;
  onSort: (newSort: string) => void;
  options: { id: string; name: string; type?: string }[] | undefined;
};

export function ChannelSelect({ options, channelId, onSort, sx, ...other }: ChannelSelectProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        onClick={handleOpenPopover}
        endIcon={<Iconify icon={openPopover ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
        sx={sx}
        {...other}
      >
        Channel:&nbsp;
        <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {options?.find((option) => option.id === channelId)?.name}
        </Typography>
      </Button>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          {options?.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === channelId}
              onClick={() => {
                onSort(option.id);
                handleClosePopover();
              }}
            >
              <Box display="flex" alignItems="center" gap='0.5rem'>
                {option.type ? <Icon icon={channelIcons[option.type!]}/> : null }
                {option.name}
              </Box>
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
