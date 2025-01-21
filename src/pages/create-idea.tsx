import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCreateIdeaMutation } from 'src/libs/service/idea/idea';
import IdeaForm from 'src/components/text-voice-input/IdeaForm'
import { IdeaFormat } from "src/interfaces/Idea";

import { Button, Card, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { PillarSelect } from 'src/sections/pillar/pillar-select';
import VoiceToTextButton from 'src/components/text-voice-input/VoiceRecorderButton';
import { useGetAllPillarQuery } from 'src/libs/service/home';

// ----------------------------------------------------------------------

export default function Page() {


  const [pillar, setPillar] = useState<string>('');
  const [pillarList, setPillarList] = useState<Array<{ id: string, name: string }> | undefined>([]);

  const {
    data: pillarData,
    error: pillarError
  } = useGetAllPillarQuery();

  useEffect(() => {
    if (pillarData) {
      const pillarIdAndName = pillarData?.data?.map((pillarItem) => {
        const selectedFields = { id: pillarItem.id, name: pillarItem.name };
        return selectedFields;
      });
      setPillarList(pillarIdAndName);
    };
  }, []);

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

    await createIdea({
      text: ideaToSubmit.text || "",
      voice_input: ideaToSubmit.voice_input || null,
      pillar_id: ideaToSubmit.pillar_id || "",
    });
    // await fetchData();
  } catch (error: any) {
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
      <Card sx={{ padding: '2rem' }}>
        {/* Title */}
        <Typography variant='h4' mb='1rem'>
          Share Your Idea
        </Typography>

        {/* Select content pillar */}
        <PillarSelect pillarName={pillar}
          onSort={handleSort}
          options={pillarList} />

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
    </DashboardContent>
  </>
);
}
