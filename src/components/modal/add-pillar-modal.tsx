// src/components/modal/basic-modal.tsx
import React, { useState } from 'react';

import {
  Box,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
} from '@mui/material';


interface AddPillarProps {
  open: boolean,
  onClose: () => void,
  isLoading?: boolean;
  onAddItem: (name: string, description: string, primaryKeyword: string) => void;
}


export function AddPillarModal({
  open,
  onClose,
  isLoading,
  onAddItem
}: AddPillarProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');

  const handleAddItem = () => {
    if (name.trim() && description.trim() && primaryKeyword.trim() && !isLoading) {
      onAddItem(name, description, primaryKeyword);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Add new content pillar</DialogTitle>
      <DialogContent>
        <Box display='flex' flexDirection='column' gap='1rem'>
          <TextField 
            required
            label='Name'
            type='text'
            fullWidth
            variant='standard'
            onChange={(e) => {
              setName(e.target.value)
            }}
          />

          <TextField 
            required
            label='Primary keyword'
            type='text'
            fullWidth
            variant='standard'
            onChange={(e) => {
              setPrimaryKeyword(e.target.value)
            }}
          />

          <TextField 
            required
            label='Description'
            type='text'
            fullWidth
            multiline
            variant='standard'
            onChange={(e) => {
              setDescription(e.target.value)
            }}
          />

          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color='inherit'
            disabled={isLoading}
            sx={{ mt: '1rem' }}
          >
            {isLoading ? 'Loading...' : `Submit`}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}