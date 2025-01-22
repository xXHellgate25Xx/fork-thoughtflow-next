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
  CircularProgress
} from '@mui/material';


interface GenericModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (name: string) => void;
  isLoading?: boolean;
  modalTitle: string;
  textFieldText: string;
  buttonText: string;
}

export function GenericModal({
  open,
  onClose,
  onAddItem,
  isLoading=false,
  modalTitle,
  textFieldText,
  buttonText,
}: GenericModalProps) {
  const [name, setName] = useState('');

  const handleAddItem = () => {
    if (name.trim() && !isLoading) {
      onAddItem(name);
      setName('');
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
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={textFieldText}
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          sx={{color:'inherit'}}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      
      <DialogActions>
        <Box 
          gap='1rem'
          sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}
        >
          {isLoading && <CircularProgress size={34} />}
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : `${buttonText}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}