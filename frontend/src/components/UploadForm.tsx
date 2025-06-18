import React, { useState } from 'react';
import { Button, Container, Typography } from '@mui/material';
import { uploadPDF } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const UploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage('Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await uploadPDF(formData);
      setMessage(`Template created with ID: ${result.template_id}`);
      setTimeout(() => navigate('/admin'), 3000);
    } catch (error) {
      setMessage('Error uploading PDF');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Upload PDF
      </Typography>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <Button type="submit" variant="contained" color="primary">
          Upload
        </Button>
      </form>
      {message && <Typography>{message}</Typography>}
    </Container>
  );
};

