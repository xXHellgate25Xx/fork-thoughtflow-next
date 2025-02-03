import { Typography, Card, TextField, Box, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { channelIcons } from 'src/theme/icons/channel-icons';

// ----------------------------------------------------------------------

export default function Page() {
  const [channelType, setChannelType] = useState('wix');

  const availableTypes = [
    { id: 'wix', label: 'Wix' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'instagram', label: 'Instagram' }
  ]

  return (
    <>
      <Helmet>
        <title> {`Add channel - ${CONFIG.appName}`}</title>
      </Helmet>

      <DashboardContent>
        <Typography variant='h4' mb='1rem'>
          Add channel
        </Typography>

        <Card sx={{ padding: '2rem' }}>
          <Box display='flex' flexDirection='column' gap='0.5rem'>
            <Typography>Name</Typography>
            <TextField fullWidth/>

            <Typography>URL</Typography>
            <TextField fullWidth/>

            <Typography>Channel voice</Typography>
            <TextField fullWidth multiline rows={10}/>

            <Typography>Channel type</Typography>
            <Box display='flex' gap='1rem' mb='0.5rem'>
            {availableTypes.map((card, index) => (
              <Card
                onClick={() => setChannelType(card.id)}
                data-active={channelType === card.id ? '' : undefined}
                sx={{
                  padding: '1rem',
                  height: '100%',
                  '&[data-active]': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selectedHover',
                    },
                  },
                }}
              >
                <Box display='flex' alignItems='center' gap='0.5rem'>
                  <Icon icon={channelIcons[card.id]}/>
                  {card.label}
                </Box>
              </Card>
            ))}
            </Box>

            <Typography>Integration (coming soon)</Typography>

            <Button
              size='large'
              color='inherit'
              variant='contained'
              sx={{ mt: '1rem' }}
            >
              Submit
            </Button>
          </Box>
        </Card>
      </DashboardContent>
    </>
  );
}
