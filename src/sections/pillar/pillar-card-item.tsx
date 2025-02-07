import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export type PillarItem = {
  id: string;
  name: string;
  is_active?: boolean;
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
      <Stack spacing={2} minHeight={155} sx={{ p: 3 }}>
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
          {product.name}
        </Link>
        
        {/* <Box sx={{ flexGrow: 1 }} /> */}
        
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {renderStatus}
        </Box>
      </Stack>
    </Card>
  );
}
