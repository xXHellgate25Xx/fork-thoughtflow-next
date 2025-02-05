import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import IdeaForm from 'src/components/text-voice-input/IdeaForm'
import { IdeaFormat } from "src/interfaces/idea-interfaces";
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
import VoiceToTextButton from 'src/components/text-voice-input/VoiceRecorderButton';
import { useGetAllPillarQuery } from 'src/libs/service/pillar/home';
import {
  useCreateIdeaMutation,
  useCreateIdeaContentMutation
} from 'src/libs/service/idea/idea';
import {
  useGenerateContentMutation,
} from 'src/libs/service/content/generate';
import { fromPlainText } from 'ricos-content/libs/fromPlainText';
// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const [createIdea] = useCreateIdeaMutation();
  const [generateContent] = useGenerateContentMutation();
  const [createIdeaContent] = useCreateIdeaContentMutation();

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

  const [progress, setProgress] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pillar, setPillar] = useState<string>(pillarIdAndName?.[0]?.id as string);
  const [newIdea, setNewIdea] = useState<Partial<IdeaFormat>>({
    text: "",
    voice_input: null,
  });

  const handleSort = useCallback((newPillar: string) => {
    setPillar(newPillar);
  }, []);

  const handleSubmit = async (updatedIdea?: Partial<IdeaFormat>) => {
    try {
      const ideaToSubmit = updatedIdea || newIdea;
      setIsGenerating(true);
      const { data: latestIdeaData } = await createIdea({
        text: ideaToSubmit.text || "",
        voice_input: ideaToSubmit.voice_input || null,
        pillar_id: ideaToSubmit.pillar_id || "",
      });

      setProgress(30);

      const { data: generationData } = await generateContent({
        idea: ideaToSubmit.text,
        feedback: "",
        content: "",
        action: "initial"
      });

      setProgress(80);
      const { data: contentData } = await createIdeaContent({
        ideaId: latestIdeaData?.data?.[0]?.id,
        payload: {
          content_body: generationData?.content,
          rich_content: fromPlainText(generationData?.content || ""),
          title: generationData?.title,
          excerpt: "",
          status: "draft",
          content_type: "Blog Post"
        }
      });

      setProgress(100);

      setIsGenerating(false);
      router.replace(`/content/${contentData?.data?.[0]?.content_id}`);
    } catch (error: any) {
      setIsGenerating(false);
      console.error("Error during creating content:", error);
      setSnackbar({
        open: true,
        message: "Create content failed!",
        severity: "error"
      })
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
          <Card sx={{ padding: '2rem', justifyItems: "center", alignItems: "center" }}>
            <AutoFixHighIcon sx={{ justifyContent: "center", left: "40%", fontSize: "3rem" }} />
            <Typography variant='h2' mb='1rem' align="center">
              Generating content...
            </Typography>
            <Typography variant='body1' mb='1rem' align="center">
              Please wait while we generating content from your ideas
            </Typography>
            <Box sx={{ width: '70%' }}>
              <LinearProgress variant="determinate" value={progress} sx={{ color: "black", mt: 1 }} />
            </Box>
            <Card
              sx={{
                padding: '2rem',
                border: 1,
                gap: 1,
                p: 1,
                mt: 2,
                width: "70%"
              }}
            >
              <Typography variant='body1' mb='1rem' align="left" sx={{ color: "black" }}>
                {progress < 30 ? <CircularProgress size="1.25rem" sx={{ color: "black", mr: 2 }} /> :
                  <CheckCircleOutlineIcon sx={{ mr: 2 }} />}
                Analyzing content requirement
              </Typography>
              <Typography variant='body1' mb='1rem' align="left" sx={{ color: progress < 30 ? "grey" : "black" }}>
                {progress < 80 ?
                  progress < 30 ? <PendingOutlinedIcon sx={{ color: "black", mr: 2, fontSize: "1.5rem" }} /> :
                    <CircularProgress size="1.25rem" sx={{ color: "black", mr: 2, fontSize: "1.5rem" }} /> :
                  <CheckCircleOutlineIcon sx={{ color: "black", mr: 2 }} />}
                Writing content draft
              </Typography>
              <Typography variant='body1' mb='1rem' align="left" sx={{ color: progress < 80 ? "grey" : "black" }}>
                {progress < 100 ?
                  progress < 80 ? <PendingOutlinedIcon sx={{ color: "black", mr: 2, fontSize: "1.5rem" }} /> :
                    <CircularProgress size="1.25rem" sx={{ color: "black", mr: 2, fontSize: "1.5rem" }} /> :
                  <CheckCircleOutlineIcon sx={{ color: "black", mr: 2 }} />}
                Finalize formating
              </Typography>
            </Card>
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
