import type { IdeaFormat } from 'src/interfaces/idea-interfaces';

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Card,
  Alert,
  Snackbar,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllPillarQuery } from 'src/libs/service/pillar/home';
import { useIdeaToContentMutation } from 'src/libs/service/idea/idea';

import IdeaForm from 'src/components/text-voice-input/IdeaForm';
import VoiceToTextButton from 'src/components/text-voice-input/VoiceRecorderButton';

import { PillarSelect } from 'src/sections/pillar/pillar-select';
import { ModelSelect } from 'src/sections/model/model-select';
import { ModelList } from 'src/utils/model_list';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();

  const location = useLocation();
  const navigationState = location.state as { id?: string; name?: string };
  useEffect(() => {
    if (navigationState?.id && navigationState?.name) {
      console.log('Navigated from pillar:', navigationState);
    }
  }, [navigationState]);
  
  const [ideaToContent] = useIdeaToContentMutation();
  const [pillarIdAndName, setPillarIdAndName] = useState<
    { id: string; name: string; primaryKeyword: string }[] | undefined
  >(undefined);

  const [modelId, setModelId] = useState<string>(ModelList[0].id);
  const [modelIdAndName, setModelIdAndName] = useState<
    {id: string; name: string}[] | undefined
  >(ModelList);
  const { data: pillarData, error: pillarError } = useGetAllPillarQuery();

  useEffect(() => {
    if (pillarData) {
      const formattedPillars = pillarData?.data
        ?.filter((pillarItem) => pillarItem.is_active)
        .map((pillarItem) => {
          const selectedFields = { 
            id: pillarItem.id, 
            name: pillarItem.name, 
            primaryKeyword: pillarItem.primary_keyword 
          };
          return selectedFields;
        }) ?? [];
      setPillarIdAndName( formattedPillars.length > 0?
        formattedPillars :
        [{id: '1', name: 'No existing pillar', primaryKeyword: ''}]
      );
    }
  }, [pillarData]);



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

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pillar, setPillar] = useState<string>('');
  const [newIdea, setNewIdea] = useState<Partial<IdeaFormat>>({
    text: '',
    voice_input: null,
  });
  const storedText = sessionStorage.getItem('storedIdea');

  useEffect(() => {
    if (navigationState?.id) {setPillar(navigationState?.id ?? '');}
    else {setPillar(pillarIdAndName?.[0]?.id ?? '')}
  }, [navigationState, pillarIdAndName]);

  const handleSelectPillar = useCallback((newPillar: string) => {
    setPillar(newPillar);
  }, []);

  const handleSelectModel = (chosenModelId: string) => {
    setModelId(chosenModelId);
  };


  const handleSubmit = async (updatedIdea?: Partial<IdeaFormat>) => {
    if (!updatedIdea?.text) {
      setSnackbar({
        open: true,
        message: 'Please enter your idea!',
        severity: 'error'
      });
      return;
    }
    try {
      setIsGenerating(true);
      setNewIdea({
        text: updatedIdea?.text, 
        voice_input: updatedIdea?.voice_input
      });

      const { data: ideaToContentData } = await ideaToContent({
        text: updatedIdea?.text || '',
        voice_input: updatedIdea?.voice_input || null,
        pillar_id: pillar,
        model: modelId
      });
      if(!ideaToContentData){
        setSnackbar({
          open: true,
          message: 'Fail to create content from idea!',
          severity: 'error'
        });
        setIsGenerating(false);
        return;
      }


      setIsGenerating(false);
      router.replace(`/idea/${ideaToContentData?.idea_id}`);
    } catch (error: any) {
      setIsGenerating(false);
      console.error('Error during creating content:', error);
      setSnackbar({
        open: true,
        message: 'Create content failed!',
        severity: 'error',
      });
    }
  };

  const handleTranscription = (texts: string) => {
    setNewIdea({ ...newIdea, text: texts });
    sessionStorage.setItem('storedIdea', `${storedText} ${texts}`);
  };

  return (
    <>
      <Helmet>
        <title> {`Create an Idea - ${CONFIG.appName}`}</title>
      </Helmet>
      <DashboardContent>
        {isGenerating ? (
          <Card sx={{ padding: '2rem', justifyItems: 'center', alignItems: 'center' }}>
            <AutoFixHighIcon sx={{ justifyContent: 'center', left: '40%', fontSize: '3rem' }} />
            <Typography variant="h2" mb="1rem" align="center">
              Generating content...
            </Typography>
            <Typography variant="body1" mb="1rem" align="center">
              Hang tight—your genius is being transformed into magic ✨🧠
            </Typography>
            <Box sx={{ width: '70%' }}>
              <LinearProgress
                variant="indeterminate"
                color='inherit'
                sx={{ mt: 1 }}
              />
            </Box>
          </Card>
        ) : (
          <Card sx={{ padding: '2rem' }}>
            {/* Title */}
            <Typography variant="h4" mb="1rem" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Let&apos;s get this thought out of your head
              <EditIcon sx={{ fontSize: '1.5rem' }} />
            </Typography>

            <Box sx={{display: 'flex', flexDirection:'row', gap: 2}}>
              {/* Select content pillar */}
              <PillarSelect
                pillarId={pillar}
                onSort={handleSelectPillar}
                options={pillarIdAndName}
              />
              {/* Select model */}
              <ModelSelect
                modelId={modelId}
                onSort={handleSelectModel}
                options={modelIdAndName}
              />
            </Box>    

            {/* Buttons to choose Type or Voice input */}
            <Box display='flex' alignItems='center' my='1rem' sx={{ width: 'auto' }} gap='1rem'>
              <VoiceToTextButton
                language='en-US'
                onTranscribe={handleTranscription}
                onAudioRecorded={(childAudioBlob) => {
                  setAudioBlob(childAudioBlob);
                }}
              />

              {/* TODO: Replace by text editor */}
              <Card sx={{ padding: '2rem', width: '80%', height: '100%' }}>
                <IdeaForm
                  onSubmitSuccess={() =>
                    setNewIdea({
                      text: '',
                      voice_input: null,
                    })
                  }
                  idea={null}
                  editedIdea={newIdea}
                  audioBlob={audioBlob}
                  setEditedTexts={setNewIdea}
                  setAudioBlob={setAudioBlob}
                  handleEditSubmit={handleSubmit}
                  currentPillarId={pillar}
                />
              </Card>
            </Box>
          </Card>
        )}

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
