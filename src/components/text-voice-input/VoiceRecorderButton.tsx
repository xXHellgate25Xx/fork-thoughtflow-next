import React, { useState, useRef } from "react";
import { Box, Fab, Typography, Snackbar, Alert, Button } from "@mui/material";
import { Icon } from '@iconify/react';

interface VoiceButtonForm {
  language: string;
  onTranscribe: (voiceTranscription: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
}

const punctuations: Record<string, string> = {
  " comma": ",",
  " period": ".",
  " question mark": "?",
  " exclamation mark": "!",
  " semicolon": ";",
  " colon": ":",
  " dash": "-",
};

const VoiceToTextButton: React.FC<VoiceButtonForm> = ({
  language,
  onTranscribe,
  onAudioRecorded,
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks = useRef<BlobPart[]>([]);

  const SpeechRecognition =
    (typeof window !== "undefined" && (window as any).SpeechRecognition) ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return (
      <Box>
        <Typography>
          Your browser does not support speech recognition!
        </Typography>
      </Box>
    );
  }

  const initializeRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = () => setIsListening(false);

    setRecognitionInstance(recognition);
    return recognition;
  };

  const handleRecognitionResult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += ` ${processTranscription(result[0].transcript)}`;
      } else {
        interimTranscript += ` ${result[0].transcript}`;
      }
    }

    const uniqueInterim = Array.from(
      new Set(interimTranscript.trim().split(" "))
    ).join(" ");
    const updatedTranscript = `${finalTranscript} ${uniqueInterim}`
      .replace(/\s+/g, " ")
      .trim();

    onTranscribe(updatedTranscript);
  };

  const handleRecognitionError = (event: any) => {
    let message = "An error occurred during speech recognition.";
    let severity: "warning" | "error" = "error";

    if (event.error === "no-speech") {
      message = "Do you want to say something?";
      severity = "warning";
    } else if (event.error === "aborted") {
      message = "Sorry! Your message was aborted. Please try again!";
    }

    setSnackbar({ open: true, message, severity });
  };

  const startListening = async () => {
    const recognition = recognitionInstance || initializeRecognition();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = []; // Reset chunks
        onAudioRecorded(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      recognition.start();
    } catch (error) {
      console.error("Error accessing audio stream:", error);
      setSnackbar({
        open: true,
        message: "Unable to access microphone.",
        severity: "error",
      });
    }
  };

  const stopListening = () => {
    // Stop Speech Recognition
    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);
    }

    // Stop Media Recorder
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    // Stop all tracks in the media stream
    if (mediaRecorder?.stream) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    setIsListening(false);
  };

  const processTranscription = (rawText: string) => {
    const capitalized = rawText.charAt(0).toUpperCase() + rawText.slice(1);
    return capitalized
      .replace(
        /\b(comma|period|question mark|exclamation mark|semicolon|colon|dash)\b/gi,
        (match) => punctuations[` ${match.toLowerCase()}`] || match
      )
      .replace(/([.!?]\s)(\w)/g, (_, p1, p2) => p1 + p2.toUpperCase());
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        margin: "10px",
      }}
    >
      <Button
        sx={{ padding: '2rem', width: '100%' }}
        color={isListening ? 'error' : 'inherit'}
        size='large'
        startIcon={<Icon width='2rem'
          icon={isListening ? 'fluent:mic-record-24-filled' : 'ph:microphone-fill'} />}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? 'Stop Recording' : 'Start Recording'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoiceToTextButton;
