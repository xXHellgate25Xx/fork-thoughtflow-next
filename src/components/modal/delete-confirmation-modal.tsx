import React from 'react';
import {
  Box,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this channel? This action cannot be undone.',
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      
      <DialogContent>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Box 
          gap='1rem'
          sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', p: 2 }}
        >
          <Button 
            onClick={onClose} 
            variant='outlined'
            color="inherit"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={onConfirm} 
            variant="contained" 
            color="primary"
            disabled={isDeleting}
            sx={{ minWidth: '80px', bgcolor: '#00396e', '&:hover': { bgcolor: '#002244' } }}
          >
            {isDeleting ? 'Deleting...' : 'OK'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
} 