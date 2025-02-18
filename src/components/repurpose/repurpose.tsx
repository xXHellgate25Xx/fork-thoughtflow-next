// src/components/modal/basic-modal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  ButtonPropsColorOverrides,
  Typography,
  Link
} from '@mui/material';

interface RepurposeFormProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  onOkay: () => void;
  setParentText?: React.Dispatch<React.SetStateAction<string>>;
  isLoading?: boolean;
  isPublished?: boolean;
  modalTitle: string;
  modalSubTitle?: string;
  textFieldValue?: string;
  customChildren?: React.ReactNode;
  buttonText: string;
  textInputRef?: React.Ref<any>
  storageTextVarName?: string,
  channel_name: string,
  channel_url: string,
  published_url: string,
  styling?: {
    buttonColor?: any;
    multiline?: boolean | undefined;
    rows?: number;
    enableCloseButton?: boolean
  }
}

export function RepurposeForm({
  open,
  onClose,
  onPublish,
  onOkay,
  setParentText,
  isLoading=false,
  isPublished=false,
  modalTitle,
  modalSubTitle,
  textFieldValue,
  customChildren,
  buttonText,
  textInputRef,
  storageTextVarName='placeholder',
  channel_name,
  channel_url,
  published_url,
  styling
}: RepurposeFormProps) {
  const [text, setText] = useState<string>('');
  const storedText = sessionStorage.getItem(storageTextVarName);

  useEffect(()=>{
    setText(storedText || textFieldValue ||  '');
  },[textFieldValue, storedText]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
    <DialogTitle>{modalTitle}</DialogTitle>
      {modalSubTitle? 
      <Typography variant='h2' sx={{ml: 3}}>{modalSubTitle}</Typography>
      : <></>}
      
      <DialogContent>
      <Typography variant='body1' sx={{ml: 3}}>
        {channel_name} : {" "}
        <Link href={channel_url} target="_blank" rel="noopener noreferrer">
          {channel_url}
        </Link>
      </Typography>
      </DialogContent>
      
      <DialogActions>
        <Box 
          gap='1rem'
          sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', p: 2 }}
        >
          {isLoading && <CircularProgress size={34} />}
          <Button 
            onClick={onPublish} 
            variant="contained" 
            color={styling?.buttonColor? styling?.buttonColor : "inherit"}
            disabled={isLoading}
          >
            {isLoading ? 'Repurposing...' : `${buttonText}`}
          </Button>
          {styling?.enableCloseButton? 
            <Button 
              onClick={onClose} 
              variant='outlined'
              color={styling?.buttonColor? styling?.buttonColor : "inherit"}
            >
              Cancel
          </Button> : <></>}
          
        </Box>
      </DialogActions>
    </Dialog>
  );
}