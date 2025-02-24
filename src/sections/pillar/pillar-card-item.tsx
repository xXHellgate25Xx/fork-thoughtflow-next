import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import { Label } from 'src/components/label';
import { Typography } from '@mui/material';
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

export type PillarItem = {
  id: string;
  name: string;
  is_active?: boolean;
  description?: string;
  primary_keyword?: string;
  n_published?: number;
  n_draft?: number;
  content_views?: number;
};

export function PillarCardItem({ product, onClick }: { product: PillarItem, onClick?: () => void }) {
  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.is_active && 'success') || 'default'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        // position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {!product.is_active ? 'inactive' : 'active'}
    </Label>
  );
  
  return (
    <Card
      onClick={onClick} 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s ease',
        '&:hover': onClick && {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box display='flex' gap='1rem' padding='1.5rem'>
        <Box flexGrow={1}>
          <Box display='flex' alignItems='center' gap='0.5rem'>
            {renderStatus}
            <Typography variant='h6'>{product.name}</Typography>
          </Box>
          
          <Box>
            <Box>
              <Typography variant='caption' fontWeight='fontWeightBold'>Primary keyword: </Typography>
              <Typography variant='caption'>{product.primary_keyword}</Typography>
            </Box>
            <Box>
              <Typography variant='caption' fontWeight='fontWeightBold'>Description: </Typography>
              <Typography variant='caption'>{product.description}</Typography>
            </Box>
          </Box>
        </Box>

        <Box display='flex' flexDirection='column' gap='0.5rem' alignItems='baseline'>
          <Box display='flex' flexDirection='row' gap='0.5rem'>
            <Box display='flex' gap='0.5rem' alignItems='center'>
              <Label color='info'>DRAFT</Label>
              <Typography>{product.n_draft ?? 0}</Typography>
            </Box>
            -
            <Box display='flex' gap='0.5rem' alignItems='center'>
              <Label color='success'>PUBLISHED</Label>
              <Typography>{product.n_published ?? 0}</Typography>
            </Box>
          </Box>
          
          <Box  display='flex' flexDirection='row' gap='0.5rem' alignItems='center'>
            <Icon icon="carbon:view-filled" width={20}/>
            <Typography fontWeight='fontWeightBold'>Content views:</Typography>
            <Typography>{product.content_views ?? 0}</Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
