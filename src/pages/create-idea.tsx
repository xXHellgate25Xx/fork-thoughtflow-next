import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCreateIdeaMutation } from 'src/libs/service/idea/idea';
import IdeaForm from 'src/components/text-voice-input/IdeaForm'
import { IdeaFormat } from "src/interfaces/Idea";
import { useRouter } from 'src/routes/hooks';

import {
  Button,
  Card,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Box from '@mui/material/Box';
import { PillarSelect } from 'src/sections/pillar/pillar-select';
import VoiceToTextButton from 'src/components/text-voice-input/VoiceRecorderButton';
import { useGetAllPillarQuery } from 'src/libs/service/home';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  let pillarIdAndName;
  const {
    data: pillarData,
    error: pillarError
  } = useGetAllPillarQuery();

  if (pillarData) {
    pillarIdAndName = pillarData?.data?.map((pillarItem) => {
      const selectedFields = { id: pillarItem.id, name: pillarItem.name };
      return selectedFields;
    });
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pillar, setPillar] = useState<string>(pillarIdAndName?.[0]?.id as string);
  const [newIdea, setNewIdea] = useState<Partial<IdeaFormat>>({
    text: "",
    voice_input: null,
  });

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [createIdea] = useCreateIdeaMutation();

  const handleSort = useCallback((newPillar: string) => {
    setPillar(newPillar);
  }, []);

  const handleSubmit = async (updatedIdea?: Partial<IdeaFormat>) => {
    try {
      const ideaToSubmit = updatedIdea || newIdea;
      setIsGenerating(true);
      await createIdea({
        text: ideaToSubmit.text || "",
        voice_input: ideaToSubmit.voice_input || null,
        pillar_id: ideaToSubmit.pillar_id || "",
      });
      setIsGenerating(false);
      router.push("/contents");
    } catch (error: any) {
      setIsGenerating(false);
      console.error("Error during creating content:", error);
      alert("Create content failed");
    }
  };

  const handleTranscription = (texts: string) => {
    setNewIdea({ ...newIdea, text: texts });
  }

  return (
    <>
      <Helmet>
        <title> {`Create an Idea - ${CONFIG.appName}`}</title>
      </Helmet>
      <DashboardContent>

        {isGenerating ?
            <Card sx={{ padding: '2rem', justifyContent:"center" }}>
              <Typography variant='h2' mb='1rem' align="center">
                Generating your idea
              </Typography>
              <LinearProgress />
            </Card> :
            <Card sx={{ padding: '2rem' }}>
              {/* Title */}
              <Typography variant='h4' mb='1rem'>
                Share Your Idea
              </Typography>

              {/* Select content pillar */}
              <PillarSelect
                pillarId={pillar}
                onSort={handleSort}
                options={pillarIdAndName}
              />

              {/* Buttons to choose Type or Voice input */}
              <Box display="flex" alignItems="center" my='1rem' sx={{ width: 'auto' }} gap='1rem'>
                <VoiceToTextButton
                  language="en-US"
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
                        text: "",
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
        }


        <Snackbar
          open={snackbar.open}
          autoHideDuration={20000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            variant="outlined"
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
