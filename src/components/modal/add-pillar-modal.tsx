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

interface BasicModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (name: string) => void;
  isLoading?: boolean;
}

export function BasicModal({ open, onClose, onAddItem, isLoading=false }: BasicModalProps) {
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
      <DialogTitle>Add New Pillar</DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
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
            {isLoading ? 'Adding...' : 'Add Pillar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}