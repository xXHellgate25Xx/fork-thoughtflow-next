import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Icon } from '@iconify/react';
import { Label, LabelColor } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { channelIcons } from 'src/theme/icons/channel-icons';

// ----------------------------------------------------------------------

export type ContentProps = {
  id: string;
  title: string;
  channelType: string;
  pillar: string;
  status: string;
  views: number;
  updatedAt: string;
  updatedAtFormatted: string | null;
};

type ContentTableRowProps = {
  row: ContentProps;
  onClickRow?: (id: string) => void;
  onDeleteRow?: (id: string) => Promise<void> | void;
  isDeleting?: boolean;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ContentTableRow({ row, onClickRow, onDeleteRow, isDeleting }: ContentTableRowProps) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleRoute = (id: string) => {
    setOpenPopover(null);
    console.log(id);
    router.replace(`/content/${id}`);
  };

  const handleRowClick = useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    if (onClickRow) {
      onClickRow(row.id);
    }
  }, [onClickRow, row.id]);

  const handleRowDelete = useCallback(() => {
    if (onDeleteRow && !isDeleting) {
      onDeleteRow(row.id);
      setTimeout(handleClosePopover, 1000); // time sleep 1 second
    }
  }, [onDeleteRow, row.id, isDeleting, handleClosePopover]);

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        role="checkbox"
        onClick={handleRowClick}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover', // Use MUI's built-in hover state
            transition: 'background-color 0.2s ease',
          }
        }}
      >
        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
          <Typography 
              variant="body2" 
              noWrap 
              sx={{ 
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {row.title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Icon 
            icon={row.channelType && channelIcons[row.channelType] ? channelIcons[row.channelType] : 'No Channel'}
            width={30} 
            height={30} 
          />
        </TableCell>
        <TableCell>{row.pillar}</TableCell>
        <TableCell>
            <Label
            color={labelColors[row.status]}
            >
            {row.status.toUpperCase()}
            </Label>
        </TableCell>
        <TableCell>{row.views ?? 0}</TableCell>
        <TableCell>{row.updatedAtFormatted}</TableCell>

        <TableCell 
          onClick={(event) => {
            event.stopPropagation(); // This prevents the click from bubbling up to the row
          }}
          align="right"
          sx={{ 
            cursor: 'default',
            '&:hover': {
              backgroundColor: 'transparent !important'
            }
          }}
        >
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
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
          <MenuItem
            onClick={() => {
              handleRoute(row.id);
              handleClosePopover();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem 
            disabled={isDeleting}
            onClick={handleRowDelete}
          >
            {isDeleting ? (
              <CircularProgress size={20} />
            ) : (
              <Iconify icon="solar:trash-bin-trash-bold" />
            )}
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
