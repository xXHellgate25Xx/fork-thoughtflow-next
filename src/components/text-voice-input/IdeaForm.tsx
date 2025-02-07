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
  const [titleTag, setTitleTag] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [seoSlug, setSeoSlug] = useState<string>('');
  const [uploadToStorage] = useUploadToStorageMutation();

  // Error states for validation
  const [errors, setErrors] = useState({
    ideaText: false,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTexts({ ...editedIdea, text: e.target.value });
    setErrors((prev) => ({ ...prev, ideaText: false })); // Clear error on valid input
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleTag(e.target.value);
  };

  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaDescription(e.target.value);
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
        seo_slug: seoSlug ?? null,
        seo_title_tag: titleTag ?? null,
        seo_meta_description: metaDescription ?? null,
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <TextField
            label="SEO Slug"
            value={seoSlug}
            onKeyDown={(e)=>handleKeyDown(e, setSeoSlug)}
            onChange={(e)=>handleSeoSlugChange(e, setSeoSlug)}
            fullWidth
          />

          <TextField label="Title Tag" value={titleTag} onChange={handleTitleChange} fullWidth />
        </Box>

        <TextField
          label="Meta Descriptions"
          multiline
          rows={4}
          value={metaDescription}
          onChange={handleMetaDescriptionChange}
          fullWidth
        />
      </Box>
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
