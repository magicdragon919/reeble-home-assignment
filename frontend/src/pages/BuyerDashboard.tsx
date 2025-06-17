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
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
} from '@mui/material';

export const BuyerDashboard = () => {
  // State for managing component data and UI
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [fields, setFields] = useState<AnvilField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handler for submitting the filled form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await apiClient.post(`/api/templates/${selectedTemplateId}/submissions`, formData);
      setFeedback({ message: `Submission successful! A download link would be available here: ${response.data.download_url}`, severity: 'success' });
    } catch (error) {
      setFeedback({ message: 'Submission failed. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const { id, name, type, pageNum } = field;
    const value = formData[id] || '';

    switch (type) {
      case 'shortText': case 'fullName': case 'usAddress':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} />;
      case 'longText': case 'textWrap':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} multiline rows={4} />;
      case 'date':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="date" InputLabelProps={{ shrink: true }} />;
      case 'email':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="email" />;
      case 'phone':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="tel" />;
      case 'number':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" />;
      case 'dollar':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />;
      case 'percent':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />;
      case 'charList':
        return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} inputProps={{ style: { letterSpacing: '0.5em', fontFamily: 'monospace' } }} />;
      case 'checkbox':
        return <FormControlLabel key={id} control={<Checkbox name={id} checked={!!value} onChange={handleInputChange} />} label={name} />;
      case 'radioGroup':
        return (
          <FormControl key={id} component="fieldset" fullWidth={true}>
            <FormLabel component="legend">{name}</FormLabel>
            <RadioGroup row name={id} value={value} onChange={handleInputChange}>
              <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
              <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
              <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
            </RadioGroup>
          </FormControl>
        );
      // case 'imageFile':
      //   return (
      //     <Box key={id} sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      //       <Typography variant="subtitle1" gutterBottom>{name}</Typography>
      //       <Button variant="contained" component="label">
      //         Upload File
      //         <input name={id} type="file" hidden onChange={handleFileChange} />
      //       </Button>
      //       {value && <Typography variant="body2" sx={{ mt: 1 }}>{value.name}</Typography>}
      //     </Box>
      //   );
      // case 'signature': case 'initial':
      //   return (
      //     <Box key={id} sx={{ border: '1px dashed grey', p: 4, my: 2, borderRadius: 1 }}>
      //       <Typography align="center" color="textSecondary">{name} Area (Placeholder)</Typography>
      //     </Box>
      //   );
      default:
        return <TextField key={id} name={id} label={`${name} (type: ${type})`} value={value} fullWidth={true} onChange={handleInputChange} />;
    }
  }

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
              <MenuItem key={template.anvil_template_eid} value={template.anvil_template_eid}>
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
            <Box key={field.id} sx={{ mb: 3 }}>
              {renderField(field)}
            </Box>
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