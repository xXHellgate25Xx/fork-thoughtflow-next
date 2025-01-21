import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { Button, Card, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { Icon } from '@iconify/react';
import { PillarSelect } from 'src/sections/pillar/pillar-select';

// ----------------------------------------------------------------------

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [pillar, setPillar] = useState('pillar-id-1');
  const [pillarList, setPillarList] = useState([
    { value: 'pillar-id-1', label: 'Pillar 1' },
    { value: 'pillar-id-2', label: 'Pillar 2' },
    { value: 'pillar-id-3', label: 'Pillar 3' },
    { value: 'pillar-id-4', label: 'Pillar 4' },
  ]);

  const handleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  }

  const handleSort = useCallback((newPillar: string) => {
    setPillar(newPillar);
  }, []);

  const handleSubmit = () => {
    // TODO: Implement submit
  }

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

          {/* Select content pillar */}
          <PillarSelect pillarName={pillar}
            onSort={handleSort}
            options={pillarList}/>

          {/* Buttons to choose Type or Voice input */}
          <Box display="flex" alignItems="center" my='1rem' sx={{ width: 'auto' }} gap='1rem'>
            <Button 
              sx={{ padding: '2rem', width: '20%' }}
              color={isRecording ? 'error' : 'inherit'}
              size='large'
              startIcon={<Icon width='2rem'
                icon={isRecording ? 'fluent:mic-record-24-filled' : 'ph:microphone-fill'}/>} 
              onClick={handleRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {/* TODO: Replace by text editor */}
            <Card sx={{ padding: '2rem', width: '80%', height: '300px' }}>
              Text editor placeholder
            </Card>
          </Box>

          {/* Submit button */}
          <Button
            variant='contained' 
            color='primary' 
            size='large' 
            sx={{ width: '100%', mt: '2rem' }}
            onClick={handleSubmit}
          >Generate content</Button>
        </Card>
      </DashboardContent>
    </>
  );
}
