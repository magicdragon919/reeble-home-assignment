import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { PDFTemplate, AnvilField } from '../types';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

export const BuyerDashboard = () => {
  // State for managing component data and UI
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [fields, setFields] = useState<AnvilField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // State for managing loading and feedback
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Effect to fetch the list of available templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiClient.get<PDFTemplate[]>('/api/templates');
        setTemplates(response.data);
      } catch (error) {
        setFeedback({ message: 'Could not fetch available forms.', severity: 'error' });
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Effect to fetch the fields for a specific template when one is selected
  useEffect(() => {
    if (!selectedTemplateId) {
      setFields([]); // Clear fields if no template is selected
      setFormData({});
      return;
    }

    const fetchFields = async () => {
      setIsLoadingForm(true);
      setFeedback(null);
      try {
        const response = await apiClient.get<{ fields: AnvilField[] }>(`/api/templates/${selectedTemplateId}/fields`);
        setFields(response.data.fields || []);
      } catch (error) {
        setFeedback({ message: 'Could not load the selected form.', severity: 'error' });
      } finally {
        setIsLoadingForm(false);
      }
    };

    fetchFields();
  }, [selectedTemplateId]);

  // Handler for changing the selected template
  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    setSelectedTemplateId(event.target.value);
  };

  // Handler for updating form data as the user types
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for submitting the filled form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await apiClient.post(`/api/templates/${selectedTemplateId}/submissions`, formData);
      setFeedback({ message: `Submission successful! A download link would be available here: ${response.data.download_url}`, severity: 'success' });
      // Optionally clear the form
      // setFormData({});
    } catch (error) {
      setFeedback({ message: 'Submission failed. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Buyer Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please select a form to begin filling it out.
      </Typography>

      {isLoadingTemplates ? (
        <CircularProgress />
      ) : (
        <FormControl fullWidth margin="normal">
          <InputLabel id="template-select-label">Select a Form</InputLabel>
          <Select
            labelId="template-select-label"
            id="template-select"
            value={selectedTemplateId}
            label="Select a Form"
            onChange={handleTemplateChange}
          >
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {isLoadingForm && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {fields.length > 0 && !isLoadingForm && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {fields.map((field) => (
            <TextField
              key={field.id}
              name={field.id}
              label={field.title}
              type={field.type === 'number' ? 'number' : 'text'}
              value={formData[field.id] || ''}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
          ))}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Form'}
          </Button>
        </Box>
      )}

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mt: 3 }}>
          {feedback.message}
        </Alert>
      )}
    </Paper>
  );
};