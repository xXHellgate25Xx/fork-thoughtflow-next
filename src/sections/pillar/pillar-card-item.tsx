import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Label } from 'src/components/label';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export type PillarItem = {
  id: string;
  name: string;
  is_active?: boolean;
  description?: string;
  primary_keyword?: string;
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
      <Stack spacing='1rem' minHeight={155} sx={{ p: 3 }}>
        <Link 
          color="inherit" 
          underline="hover" 
          variant="subtitle2"
          sx={{
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'normal', // Allow text to wrap
            wordBreak: 'break-word' // Ensure long words break
          }}
        >
          <Typography variant='h6'>{product.name}</Typography>
        </Link>
        
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
        
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {renderStatus}
        </Box>
      </Stack>
    </Card>
  );
}
