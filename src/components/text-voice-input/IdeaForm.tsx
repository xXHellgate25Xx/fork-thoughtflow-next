import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useUploadToStorageMutation } from "src/libs/service/storage/api-storage";
import { IdeaFormat } from "../../interfaces/Idea";

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
  currentPillarId
}) => {
  
  const [ uploadToStorage ] = useUploadToStorageMutation();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTexts({ ...editedIdea, text: e.target.value });
  };

  useEffect(()=>{
    setEditedTexts({
      ...editedIdea,
      pillar_id: currentPillarId,
    });
  },[]);

  const handleSubmit = async () => {
    try {
      const audio = audioBlob
        ? await uploadToStorage(
          {
            file: audioBlob,
            bucketName: "media",
            folderName: "voice_inputs",
            fileName: "voice"
          }    
          )
        : null;

      const updatedIdea = { ...editedIdea, voice_input: audio?.data?.Id || null };
      setEditedTexts(updatedIdea); // Updates the parent component's state
      // Wait for the parent's submit handler to execute
      await handleEditSubmit(updatedIdea);
      onSubmitSuccess?.();
      setEditedTexts({
        ...editedIdea,
        pillar_id: currentPillarId,
        text: "",
      });
      setAudioBlob?.(null);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pt: 2,
        width: "500px",
      }}
    >

      <Box sx={{ position: "relative" }}>
        <TextField
          label="Idea Text"
          multiline
          rows={10}
          value={editedIdea?.text || idea?.text}
          onChange={handleTextChange}
          fullWidth
          focused={(editedIdea?.text ?? "").length > 0}
        />
      </Box>

      <Button
        onClick={handleSubmit}
        variant='contained'
        color='primary'
        size='large'
        sx={{ width: '100%', mt: '2rem' }}>
        Generate content
      </Button>
    </Box>
  );
};

export default IdeaForm;
