import { Typography, Card, TextField, Box, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { useCreateChannelMutation } from 'src/libs/service/channel/channel';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [channelVoice, setChannelVoice] = useState('');
  const [channelType, setChannelType] = useState('wix');

  const [createChannel] = useCreateChannelMutation();
  
  const availableTypes = [
    { id: 'wix', label: 'Wix' },
    // { id: 'linkedin', label: 'LinkedIn' },
    // { id: 'instagram', label: 'Instagram' }
  ]

  const handleCreateChannel = async () => {
      await createChannel({
      payload:{
        name: channelName,
        channel_type: channelType,
        url: channelUrl,
        is_active: true,
        brand_voice_initial: channelVoice,
        account_id: localStorage.getItem('accountId')
      }
    });
    router.push("/settings");
  };


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
            <TextField 
              onChange={(name) => {setChannelName(name.target.value)}}
              fullWidth
            />

            <Typography>URL</Typography>
            <TextField 
              onChange={(url) => {setChannelUrl(url.target.value)}}
              fullWidth
            />

            <Typography>Channel voice</Typography>
            <TextField 
              onChange={(voice) => {setChannelVoice(voice.target.value)}}
              fullWidth 
              multiline 
              rows={10}
            />

            <Typography>Channel type</Typography>
            <Box display='flex' gap='1rem' mb='0.5rem'>
            {availableTypes.map((card, index) => (
              <Card
                key={index}
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
              onClick={handleCreateChannel}
            >
              Submit
            </Button>
          </Box>
        </Card>
      </DashboardContent>
    </>
  );
}
