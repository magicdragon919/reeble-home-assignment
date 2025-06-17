// src/pages/AgentDashboard.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import apiClient from '../api/apiClient';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const AgentDashboard = () => {
  const [feedback, setFeedback] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'An error occurred.';
      setFeedback(`Error: ${errorMessage}`);
      setFeedbackSeverity('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Agent Dashboard
      </Typography>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'background-color 0.2s',
          mt: 3
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography>Drag & drop a PDF here, or click to select a file</Typography>
        <Typography variant="body2" color="text.secondary">PDF files only</Typography>
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button onClick={() => {}} disabled={isLoading} variant="contained" size="large">
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Upload Template'}
        </Button>
      </Box>
      {feedback && (
        <Alert severity={feedbackSeverity} sx={{ mt: 3 }}>
          {feedback}
        </Alert>
      )}
    </Paper>
  );
};