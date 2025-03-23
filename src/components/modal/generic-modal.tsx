// src/components/modal/basic-modal.tsx
import React, { useState, useEffect } from 'react';

import {
  Box,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

interface GenericModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (text: string) => void;
  setParentText?: React.Dispatch<React.SetStateAction<string>>;
  isLoading?: boolean;
  modalTitle: string;
  modalSubTitle?: string;
  textFieldText?: string;
  textFieldValue?: string;
  customChildren?: React.ReactNode;
  buttonText: string;
  textInputRef?: React.Ref<any>
  storageTextVarName?: string,
  styling?: {
    buttonColor?: any;
    multiline?: boolean | undefined;
    rows?: number;
    enableCloseButton?: boolean
  }
}

export function GenericModal({
  open,
  onClose,
  onAddItem,
  setParentText,
  isLoading=false,
  modalTitle,
  modalSubTitle,
  textFieldText,
  textFieldValue,
  customChildren,
  buttonText,
  textInputRef,
  storageTextVarName='placeholder',
  styling
}: GenericModalProps) {
  const [text, setText] = useState<string>('');
  const storedText = sessionStorage.getItem(storageTextVarName);

  useEffect(()=>{
    setText(storedText || textFieldValue ||  '');
  },[textFieldValue, storedText]);

  const handleAddItem = () => {
    if (text.trim() && !isLoading) {
      sessionStorage.setItem(storageTextVarName, '');
      onAddItem(text);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{modalTitle}</DialogTitle>
      {modalSubTitle? 
      <Typography variant='body2' sx={{ml: 3}}>{modalSubTitle}</Typography>
      : <></>}
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={textFieldText}
          type="text"
          fullWidth
          variant="outlined"
          value={text}
          sx={{color:'inherit'}}
          onChange={(e) => {
            sessionStorage.setItem(storageTextVarName, e.target.value);
            setText(e.target.value);
            setParentText?.(e.target.value);
          }}
          disabled={isLoading}
          multiline={styling?.multiline}
          rows={styling?.rows? styling?.rows : 0}
          inputRef={textInputRef}
        />
        {customChildren}
      </DialogContent>
      
      <DialogActions>
        <Box 
          gap='1rem'
          sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', p: 2 }}
        >
          {styling?.enableCloseButton? 
            <Button 
              onClick={onClose} 
              variant='outlined'
              color={styling?.buttonColor? styling?.buttonColor : "inherit"}
              disabled={isLoading}
            >
              Cancel
          </Button> : <></>}
          
          {isLoading && <CircularProgress size={34} />}
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color={styling?.buttonColor? styling?.buttonColor : "inherit"}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : `${buttonText}`}
          </Button>
          
        </Box>
      </DialogActions>
    </Dialog>
  );
}