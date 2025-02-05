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
import { processingFilePath } from "src/utils/file-path-with-hash";
import { IdeaFormat } from "src/interfaces/idea-interfaces";

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

  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setEditedTexts({ ...editedIdea, text: newText });
  };

  useEffect(() => {
    setEditedTexts({
      ...editedIdea,
      pillar_id: currentPillarId,
    });
  }, [currentPillarId]);

  const handleSubmit = async () => {
    if (!editedIdea?.text || editedIdea.text.trim() === "") {
      setError("Text is required.");
      return;
    }

    try {
      const path = audioBlob
        ? await processingFilePath(audioBlob, "voice_inputs", "voice")
        : null;
      const audio = audioBlob
        ? await uploadToStorage({
            file: audioBlob,
            bucketName: "media",
            pathName: path || "",
          })
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
    } catch (e) {
      console.error("Error during submission:", e);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <TextField
          placeholder="Idea Text"
          multiline
          rows={10}
          value={editedIdea?.text || idea?.text || ""}
          onChange={handleTextChange}
          fullWidth
          error={!!error}
          helperText={error}
        />
      </Box>

      <Button
        onClick={handleSubmit}
        variant="contained"
        size="large"
        sx={{ width: "100%", mt: "2rem", backgroundColor: "black" }}
      >
        Generate content
      </Button>
    </Box>
  );
};

export default IdeaForm;
