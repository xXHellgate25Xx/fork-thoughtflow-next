import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Label, LabelColor } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Icon } from '@iconify/react';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { Button, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export type ChannelProps = {
  id: string;
  type: string;
  name: string;
  url: string;
};

type ChannelTableRowProps = {
  row: ChannelProps;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ChannelTableRow({ row }: ChannelTableRowProps) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell align='center'>
          <Icon icon={channelIcons[row.type]} width='2rem'/>
        </TableCell>

        <TableCell>
          <Box>
            <Typography sx={{ fontWeight: 'bold' }}>
            {row.name}
            </Typography>
            <Typography>
            {row.url}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align='right'>
          <Box display='flex' justifyContent='flex-end' gap='0.5rem'>
            <Button
              variant='outlined'
              color='inherit'
            >
              Prompt
            </Button>
            <Button
              variant='contained'
              color='inherit'
            >
              Disconnect
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}
