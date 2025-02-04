// src/components/modal/basic-modal.tsx
import React, { useState } from 'react';
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
} from '@mui/material';

interface GenericModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (text: string) => void;
  isLoading?: boolean;
  modalTitle: string;
  modalSubTitle?: string;
  textFieldText?: string;
  textFieldValue?: string;
  customChildren?: React.ReactNode;
  buttonText: string;
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
  isLoading=false,
  modalTitle,
  modalSubTitle,
  textFieldText,
  textFieldValue,
  customChildren,
  buttonText,
  styling
}: GenericModalProps) {
  const [text, setText] = useState(textFieldValue || '');

  const handleAddItem = () => {
    if (text.trim() && !isLoading) {
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
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          multiline={styling?.multiline}
          rows={styling?.rows? styling?.rows : 0}
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