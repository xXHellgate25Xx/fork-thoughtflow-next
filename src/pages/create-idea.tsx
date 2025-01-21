import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { Button, Card, Typography } from '@mui/material';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export default function Page() {
  const [inputType, setInputType] = useState(true);

  const handleTypeClick = () => {
    setInputType(true);
  };

  const handleVoiceClick = () => {
    setInputType(false);
  };

  return (
    <>
      <Helmet>
        <title> {`Create an Idea - ${CONFIG.appName}`}</title>
      </Helmet>
      <DashboardContent>
        <Card sx={{ padding: '2rem' }}>
          {/* Title */}
          <Typography variant='h4' mb='1rem'>
            Share Your Idea
          </Typography>

          {/* Buttons to choose Type or Voice input */}
          <Box display="flex" alignItems="center" mb={5} sx={{ width: 'auto' }}>
            <Button 
              variant={ inputType ? 'contained' : 'outlined' }
              color='inherit' 
              size='large' 
              sx={{ width: '50%', mr: '0.5rem' }}
              onClick={handleTypeClick}
            >Type</Button>
            <Button 
              variant={ inputType ? 'outlined' : 'contained' } 
              color='inherit' 
              size='large' 
              sx={{ width: '50%', ml: '0.5rem' }}
              onClick={handleVoiceClick}
            >Voice</Button>
          </Box>

          <Card sx={{ padding: '2rem', mb: '1rem' }}
            style={{ display: inputType ? 'none' : 'block' }}  
          >
            Voice recording placeholder
          </Card>

          <Card sx={{ padding: '2rem' }}>
            Text editor placeholder
          </Card>

          {/* Submit button */}
          <Button
            variant='contained' 
            color='primary' 
            size='large' 
            sx={{ width: '100%', mt: '2rem' }}
          >Generate content</Button>
        </Card>
      </DashboardContent>
    </>
  );
}
