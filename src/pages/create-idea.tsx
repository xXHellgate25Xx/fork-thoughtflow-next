import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import IdeaForm from 'src/components/text-voice-input/IdeaForm';
import { IdeaFormat } from 'src/interfaces/idea-interfaces';
import { useRouter } from 'src/routes/hooks';

import {
  Box,
  Button,
  Card,
  Typography,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { PillarSelect } from 'src/sections/pillar/pillar-select';
import { ChannelSelect } from 'src/sections/channel/channel-select';
import VoiceToTextButton from 'src/components/text-voice-input/VoiceRecorderButton';
import { useGetAllPillarQuery } from 'src/libs/service/pillar/home';
import { useCreateIdeaMutation, useCreateIdeaContentMutation } from 'src/libs/service/idea/idea';
import { useGenerateContentHTMLMutation } from 'src/libs/service/content/generate';
import { useGetAllChannelsOfUserQuery } from 'src/libs/service/channel/channel';
import { fromPlainText } from 'ricos-content/libs/fromPlainText';
import { fromRichTextHtml } from 'ricos-content/libs/server-side-converters';
import { useGlobalContext } from 'src/GlobalContextProvider';
import { useLocation } from 'react-router-dom';

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
  
  const [createIdea] = useCreateIdeaMutation();
  const [generateContentHTML] = useGenerateContentHTMLMutation();
  const [createIdeaContent] = useCreateIdeaContentMutation();
  const [pillarIdAndName, setPillarIdAndName] = useState<
    { id: string; name: string; primaryKeyword: string }[] | undefined
  >(undefined);
  const [channelId, setChannelId] = useState<string>('');
  const [channelIdAndName, setChannelIdAndName] = useState<
    {id: string; name: string}[] | undefined
  >(undefined);
  const { data: pillarData, error: pillarError } = useGetAllPillarQuery();
  const { data: channelData } = useGetAllChannelsOfUserQuery(); 

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

  useEffect(()=>{
    if(channelData){
      const formattedChannels = channelData?.data.map((channel: any)=>{
        const requiredPairs = {id: channel.id, name: channel.name};
        return requiredPairs;
      }) ?? [];
      setChannelId(channelData?.data?.[0]?.id ?? '');
      setChannelIdAndName(formattedChannels.length > 0?
        formattedChannels:
        [{id: '1', name: 'No existing channels'}]);
    }
  },[channelData]);

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

  const [progress, setProgress] = useState<number>(0);
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

  const handleSelectChannel = (chosenChannelId: string) => {
    setChannelId(chosenChannelId);
  };

  const handleSubmit = async (updatedIdea?: Partial<IdeaFormat>) => {
    try {
      setIsGenerating(true);
      setNewIdea({
        text: updatedIdea?.text, 
        voice_input: updatedIdea?.voice_input
      });

      const { 
        data: latestIdeaData,
        error: createIdeaError
       } = await createIdea({
        text: updatedIdea?.text || '',
        voice_input: updatedIdea?.voice_input || null,
        pillar_id: updatedIdea?.pillar_id || '',
      });

      if(!latestIdeaData){
        setSnackbar({
          open: true,
          message: 'Fail to create to idea!',
          severity: 'error'
        });
        setIsGenerating(false);
        return;
      }

      setProgress(30);

      const { data: generationData } = await generateContentHTML({
        channel_id: channelId,
        gen_content: {
          idea: updatedIdea?.text,
          pillar_name: pillarIdAndName?.find(item => item.id === pillar)?.name ?? '',
          keyword: pillarIdAndName?.find(item => item.id === pillar)?.primaryKeyword ?? ''
        }
      });
      if(!generationData){
        setSnackbar({
          open: true,
          message: 'Fail to generate content from new idea!',
          severity: 'error'
        });
        setIsGenerating(false);
        return;
      }

      setProgress(80);
      const { data: contentData } = await createIdeaContent({
        ideaId: latestIdeaData?.data?.[0]?.id,
        payload: {
          content_body: generationData?.content,
          rich_content: generationData?.rich_content || fromPlainText(generationData?.content || ""),
          title: generationData?.title,
          excerpt: generationData?.excerpt || '',
          status: 'draft',
          content_type: 'Blog Post',
          seo_meta_description: generationData?.seo_meta_description || null,
          seo_slug: generationData?.seo_slug || null,
          seo_title_tag: generationData?.title || null,
          channel_id: channelId,
          long_tail_keyword: generationData?.long_tail || null,
          content_html: generationData?.content_html,
        }
      });
      
      if(!contentData){
        setSnackbar({
          open: true,
          message: 'Fail to save content!',
          severity: 'error'
        });
        setIsGenerating(false);
        return;
      }

      setProgress(100);

      setIsGenerating(false);
      router.replace(`/content/${contentData?.data?.[0]?.content_id}`);
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
              Please wait while we generating content from your ideas
            </Typography>
            <Box sx={{ width: '70%' }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                color='inherit'
                sx={{ mt: 1 }}
              />
            </Box>
            <Card
              sx={{
                padding: '1.5rem',
                my: '2rem',
                width: '70%',
              }}
            >
              <Box display='flex' alignItems='center' mb='1rem'>
                {progress < 30 ? (
                  <CircularProgress size="1.25rem" sx={{ color: 'black', mr: 2 }} />
                ) : (
                  <CheckCircleOutlineIcon sx={{ mr: 2 }} />
                )}
                <Typography>Analyzing content requirement</Typography>
              </Box>
              <Box display='flex' alignItems='center' mb='1rem'>
                {progress < 80 ? (
                  progress < 30 ? (
                    <PendingOutlinedIcon sx={{ color: 'grey', mr: 2, fontSize: '1.5rem' }} />
                  ) : (
                    <CircularProgress
                      size="1.25rem"
                      sx={{ color: 'black', mr: 2, fontSize: '1.5rem' }}
                    />
                  )
                ) : (
                  <CheckCircleOutlineIcon sx={{ color: 'black', mr: 2 }} />
                )}
                <Typography sx={{ color: progress < 30 ? 'grey' : 'black' }}>Writing content draft</Typography>
              </Box>
              <Box display='flex' alignItems='center'>
                {progress < 100 ? (
                  progress < 80 ? (
                    <PendingOutlinedIcon sx={{ color: 'grey', mr: 2, fontSize: '1.5rem' }} />
                  ) : (
                    <CircularProgress
                      size="1.25rem"
                      sx={{ color: 'black', mr: 2, fontSize: '1.5rem' }}
                    />
                  )
                ) : (
                  <CheckCircleOutlineIcon sx={{ color: 'black', mr: 2 }} />
                )}
                <Typography sx={{ color: progress < 80 ? 'grey' : 'black' }}>Finalize formating</Typography>
              </Box>
            </Card>
          </Card>
        ) : (
          <Card sx={{ padding: '2rem' }}>
            {/* Title */}
            <Typography variant="h4" mb="1rem">
              Share Your Idea
            </Typography>

            <Box sx={{display: 'flex', flexDirection:'row', gap: 2}}>
              {/* Select content pillar */}
              <PillarSelect
                pillarId={pillar}
                onSort={handleSelectPillar}
                options={pillarIdAndName}
              />
              {/* Select content channel */}
              <ChannelSelect
                channelId={channelId}
                onSort={handleSelectChannel}
                options={channelIdAndName}
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
