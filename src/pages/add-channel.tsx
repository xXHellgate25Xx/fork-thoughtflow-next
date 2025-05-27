import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';

import { Box, Card, Button, TextField, Typography, Alert, Snackbar} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { useCreateChannelMutation } from 'src/libs/service/channel/channel';
import { useGetLinkedinAccessTokenMutation } from 'src/libs/service/linkedin/linkedin';
import { useValidateWixMutation } from 'src/libs/service/wix/wix'
import { hashPassword } from 'src/utils/ecrypt';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [channelVoice, setChannelVoice] = useState('');
  const [channelType, setChannelType] = useState('wix');
  const [wixAPIKey, setWixAPIKey] = useState('')
  const [wixAccountId, setWixAccountId] = useState('')
  const [wixSiteId, setWixSiteId] = useState('')

  const [linkedinAccessToken, setLinkedinAccessToken] = useState('');
  const [linkedinexpiresIn, setLinkedinexpiresIn] = useState(0);
  const [linkedinRefreshToken, setLinkedinRefreshToken] = useState('');
  const [linkedinRefreshTokenExpiresIn, setLinkedinRefreshTokenExpiresIn] = useState(0);
  const [linkedinScope, setLinkedinScope] = useState('');

  const [createChannel] = useCreateChannelMutation();
  const [getLinkedinAccessToken] = useGetLinkedinAccessTokenMutation();
  const [validateWix] = useValidateWixMutation();

  const availableTypes = [
    { id: 'wix', label: 'Wix' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
  ]

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleConnectLinkedin = async () => {
    const linkedin_client_id = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const thoughtflow_url = import.meta.env.VITE_PUBLIC_BASE_URL;
    const redirect_uri = `${thoughtflow_url}/linkedin-integration-popup`;
    const scopes = ['w_member_social'].join(' ');
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin_client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
  
    const popup = window.open(
      authUrl,
      'LinkedInLogin',
      'width=600,height=600,left=400,top=200'
    );
  
    const receiveMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { code } = event.data;
      if (code) {
        popup?.close();
        window.removeEventListener('message', receiveMessage);
        const {data: result, error: result_error}= await getLinkedinAccessToken(
          { 
            code: hashPassword(code) 
          });
        setLinkedinAccessToken(result?.access_token || "");
        setLinkedinexpiresIn(result?.expires_in || 0);
        setLinkedinScope(result?.scope || "");
      }
    };
  
    window.addEventListener('message', receiveMessage);
  }

  const handleCreateChannel = async () => {
    if (channelType === 'wix') {
      const {data: validateWixData, error: validateWixError} = await validateWix({
        ValidateWix: {
          wix_account_id: wixAccountId,
          wix_site_id: wixSiteId,
          wix_api_key: wixAPIKey
        }
      })
      if (validateWixError) {
        // Narrow the type to FetchBaseQueryError before accessing `data`
        const message = (validateWixError as any)?.data?.error?.message || 'Unexpected error occurred';

        setSnackbar({
          open: true,
          message,
          severity: 'error',
        });
      }
      else {
        const en_wix_api_key = await hashPassword(wixAPIKey);
        await createChannel({
        payload:{
          name: channelName,
          channel_type: channelType,
          url: channelUrl,
          is_active: true,
          brand_voice_initial: channelVoice,
          encrypted_wix_api_key: en_wix_api_key,
          wix_account_id: wixAccountId,
          wix_site_id: wixSiteId
          }
        });
        router.push("/settings");
      }
    }
    else if (channelType === 'linkedin') {
      await createChannel({
      payload:{
        name: channelName,
        channel_type: channelType,
        url: channelUrl,
        is_active: true,
        brand_voice_initial: channelVoice,
        access_token: linkedinAccessToken,
        expires_in: linkedinexpiresIn,
        }
      });
      router.push("/settings");
    }
    else if (channelType === 'instagram') {
      await createChannel({
      payload:{
        name: channelName,
        channel_type: channelType,
        url: channelUrl,
        is_active: true,
        brand_voice_initial: channelVoice,
        }
      });
      router.push("/settings");
    }
    else if (channelType === 'facebook') {
      await createChannel({
      payload:{
        name: channelName,
        channel_type: channelType,
        url: channelUrl,
        is_active: true,
        brand_voice_initial: channelVoice,
        }
      });
      router.push("/settings");
    }
  };

  const integrationFields: any = {
    wix: (
      <Box display='flex' flexDirection='column' gap='0.5rem'>
        {/* WIX-API-KEY */}
        <Box display='flex' gap='0.5rem' alignItems='baseline'>
          <Typography>WIX API KEY</Typography>
          <Typography variant='caption'>your WIX API Key with site level access</Typography>
        </Box>
        <TextField 
          onChange={(api_key) => {setWixAPIKey(api_key.target.value)}}
          fullWidth
        />
        {/* wix-account-id */}
        <Box display='flex' gap='0.5rem' alignItems='baseline'>
          <Typography>Wix account id</Typography>
          <Typography variant='caption'>the ID of your wix account</Typography>
        </Box>
        <TextField 
          onChange={(wix_account_id) => {setWixAccountId(wix_account_id.target.value)}}
          fullWidth
        />
        {/* wix-site-id */}
        <Box display='flex' gap='0.5rem' alignItems='baseline'>
          <Typography>Wix site id</Typography>
          <Typography variant='caption'>the ID of your wix site</Typography>
        </Box>
        <TextField 
          onChange={(wix_site_id) => {setWixSiteId(wix_site_id.target.value)}}
          fullWidth
        />
      </Box>
    ),
    // Future channel types can be added here
    linkedin: (
      <Box display='flex' flexDirection='column' gap='0.5rem'>
      <Button
              size='large'
              color='inherit'
              variant='contained'
              sx={{ mt: '1rem' , width: '33%' }}
              onClick={handleConnectLinkedin}
            >
              Connect to Linkedin
      </Button>
      </Box>
    )
    // instagram: <Box>Instagram Fields here</Box>,
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
            {/* Name */}
            <Box display='flex' gap='0.5rem' alignItems='baseline'>
              <Typography fontWeight='fontWeightBold'>Name</Typography>
              <Typography variant='caption'>a descriptive name to identify your channel</Typography>
            </Box>
            <TextField 
              onChange={(name) => {setChannelName(name.target.value)}}
              fullWidth
            />

            {/* Site domain */}
            <Box display='flex' gap='0.5rem' alignItems='baseline'>
              <Typography fontWeight='fontWeightBold'>Site domain</Typography>
              <Typography variant='caption'>e.g. www.domain.com</Typography>
            </Box>
            <TextField 
              onChange={(url) => {setChannelUrl(url.target.value)}}
              fullWidth
            />
          
            {/* Channel voice */}
            <Box display='flex' gap='0.5rem' alignItems='baseline'>
              <Typography fontWeight='fontWeightBold'>Channel voice</Typography>
              <Typography variant='caption'>the unique personality and tone to write content for this channel</Typography>
            </Box>
            <TextField 
              onChange={(voice) => {setChannelVoice(voice.target.value)}}
              fullWidth 
              multiline 
              rows={10}
            />

            <Typography fontWeight='fontWeightBold'>Channel type</Typography>
            <Box display='flex' gap='1rem' mb='0.5rem'>
            {availableTypes.map((card, index) => (
              <Card
                key={index}
                onClick={() => setChannelType(card.id)}
                data-active={channelType === card.id ? '' : undefined}
                sx={{
                  cursor: 'pointer',
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

            <Typography fontWeight='fontWeightBold'>Integration</Typography>
            {integrationFields[channelType] ?? (
            <Typography mt={1}>(Coming soon)</Typography>
            )}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={20000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            variant='outlined'
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
