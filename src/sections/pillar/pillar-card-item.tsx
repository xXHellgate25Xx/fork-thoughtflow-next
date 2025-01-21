import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export type PillarItemProps = {
  id: string;
  name: string;
  status?: string;
};

export function PillarCardItem({ product }: { product: PillarItemProps }) {
  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        // position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status === 'sale' ? 'inactive' : 'active'}
    </Label>
  );
  
  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Link>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          {renderStatus}
        </Box>
      </Stack>
    </Card>
  );
}
