import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import apiClient from '../api/apiClient';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Alert, CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface UploadTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void; // Function to refresh the list
}

export const UploadTemplateModal = ({ open, onClose, onUploadSuccess }: UploadTemplateModalProps) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // (This is your exact onDrop logic from before)
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setIsLoading(true);
    setFeedback('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('/api/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFeedback(`Template '${file.name}' created successfully!`);
      setFeedbackSeverity('success');
      onUploadSuccess(); // Notify the parent component of success!
      // We can add a slight delay before closing to allow user to see the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'An error occurred.';
      setFeedback(`Error: ${errorMessage}`);
      setFeedbackSeverity('error');
    } finally {
      setIsLoading(false);
    }
  }, [onUploadSuccess, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload New PDF Template</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            // (Your exact dropzone styles from before)
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.400',
            borderRadius: 2, p: 6, textAlign: 'center', cursor: 'pointer', mt: 2
          }}
        >
          <input {...getInputProps()} />
          <UploadFileIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Typography>Drag & drop a PDF here, or click to select a file</Typography>
              <Typography variant="body2" color="text.secondary">PDF files only</Typography>
            </>
          )}
        </Box>
        {feedback && (
          <Alert severity={feedbackSeverity} sx={{ mt: 2 }}>
            {feedback}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};