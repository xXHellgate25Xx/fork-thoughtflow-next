import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useUploadToStorageMutation } from 'src/libs/service/storage/api-storage';
import { processingFilePath } from 'src/utils/file-path-with-hash';
import { IdeaFormat } from 'src/interfaces/idea-interfaces';
import { handleKeyDown, handleSeoSlugChange } from 'src/utils/seo';
import TextField from '../text-field/text-field';

interface IdeaFormProps {
  idea?: IdeaFormat | null;
  editedIdea?: Partial<IdeaFormat>;
  audioBlob?: Blob | null;
  setEditedTexts: React.Dispatch<React.SetStateAction<Partial<IdeaFormat>>>;
  setAudioBlob?: React.Dispatch<React.SetStateAction<Blob | null>>;
  handleEditSubmit: (updatedIdea?: Partial<IdeaFormat>) => void;
  onSubmitSuccess?: () => void;
  currentPillarId: string | null;
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  idea,
  editedIdea,
  audioBlob,
  setEditedTexts,
  setAudioBlob,
  handleEditSubmit,
  onSubmitSuccess,
  currentPillarId,
}) => {
  const [uploadToStorage] = useUploadToStorageMutation();

  // Error states for validation
  const [errors, setErrors] = useState({
    ideaText: false,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTexts({ ...editedIdea, text: e.target.value });
    setErrors((prev) => ({ ...prev, ideaText: false })); // Clear error on valid input
  };

  useEffect(() => {
    setEditedTexts({
      ...editedIdea,
      pillar_id: currentPillarId,
    });
  }, [currentPillarId]);

  const handleSubmit = async () => {
    if (!editedIdea?.text || editedIdea.text.trim() === '') {
      setErrors({ ideaText: true });
      return;
    }

    try {
      const path = audioBlob ? await processingFilePath(audioBlob, 'voice_inputs', 'voice') : null;
      const audio = audioBlob
        ? await uploadToStorage({
            file: audioBlob,
            bucketName: 'media',
            pathName: path || '',
          })
        : null;

      const updatedIdea = {
        ...editedIdea,
        voice_input: audio?.data?.Id || null,
      };
      setEditedTexts(updatedIdea); // Updates the parent component's state
      // Wait for the parent's submit handler to execute
      await handleEditSubmit(updatedIdea);
      onSubmitSuccess?.();
      setEditedTexts({
        ...editedIdea,
        pillar_id: currentPillarId,
        text: '',
      });
      setAudioBlob?.(null);
    } catch (error) {
      console.error('Error during submission:', error);
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      
      <Box sx={{ position: 'relative' }}>
        <TextField
          label="Idea Text"
          required
          multiline
          rows={10}
          value={editedIdea?.text || idea?.text || ''}
          onChange={handleTextChange}
          fullWidth
          error={errors.ideaText}
          helperText={errors.ideaText ? 'Idea Text is required' : ''}
        />
      </Box>

      <Button
        onClick={handleSubmit}
        variant="contained"
        size="large"
        sx={{ width: '100%', mt: '2rem', backgroundColor: 'black' }}
      >
        Generate content
      </Button>
    </Box>
  );
};

export default IdeaForm;
