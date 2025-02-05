import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label, LabelColor } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export type ContentProps = {
  id: string;
  title: string;
  pillar: string;
  status: string;
  views: number;
  updatedAt: string;
  updatedAtFormatted: string | null;
};

type ContentTableRowProps = {
  row: ContentProps;
  onClickRow?: (id: string) => void;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ContentTableRow({ row, onClickRow }: ContentTableRowProps) {
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

        <TableCell align="right">
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
          <MenuItem onClick={() => handleRoute(row.id)}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
